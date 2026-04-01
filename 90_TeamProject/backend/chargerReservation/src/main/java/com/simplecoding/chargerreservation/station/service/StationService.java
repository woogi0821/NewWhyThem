package com.simplecoding.chargerreservation.station.service;

import com.simplecoding.chargerreservation.charger.dto.ChargerDto;
import com.simplecoding.chargerreservation.charger.dto.MarkerDto;
import com.simplecoding.chargerreservation.station.dto.StationDto;
import com.simplecoding.chargerreservation.station.entity.StationEntity;
import com.simplecoding.chargerreservation.station.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StationService {

    private final JdbcTemplate jdbcTemplate;
    private final StationRepository stationRepository;
    private final com.simplecoding.chargerreservation.charger.repository.ChargerRepository chargerRepository;

    // ==========================================
    // 1. 데이터 조회 및 검색 로직 (사용자 API용)
    // ==========================================

    /**
     * [기능] 지도 표시용 마커 데이터 조회 (최적화 버전)
     * - 반경 3km 이내의 충전소를 20개씩 끊어서 가져옵니다.
     * - 지도에는 많은 정보가 필요 없으므로 필수 좌표 정보(MarkerDto)만 반환하여 가볍게 유지합니다.
     */
    @Transactional(readOnly = true)
    public List<MarkerDto> getStationMarkers(Double lat, Double lng, int page) {
        double radius = 1.5;
        int size = 20;
        int offset = page * size; // 페이지 번호에 따른 시작 위치 계산

        // DB 쿼리 실행: 특정 위치 기반 페이징 처리된 엔티티 리스트
        List<StationEntity> stations = stationRepository.findStationsWithinRadiusWithPaging(
                lat, lng, radius, offset, size);

        log.info("▶ [PAGING] {}페이지 조회 - 마커 개수: {}개", page, stations.size());

        return stations.stream()
                .map(s -> new MarkerDto(s.getStatId(), s.getLat(), s.getLng(), "1"))
                .collect(Collectors.toList());
    }

    /**
     * [기능] 주변 충전소 목록 조회 (상세 정보 포함 리스트)
     * - 마커 조회와 비슷하지만, 충전소 이름, 주소 등 상세 정보를 담은 StationDto를 반환합니다.
     * - 무한 스크롤이나 목록 페이징 UI에 사용됩니다.
     */
    @Transactional(readOnly = true)
    public List<StationDto> getStationsWithDistancePaged(Double userLat, Double userLng, int page) {
        double radius = 1.5;
        int size = 20;
        int offset = page * size;

        List<StationEntity> entities = stationRepository.findStationsWithinRadiusWithPaging(
                userLat, userLng, radius, offset, size);

        return entities.stream()
                .map(entity -> {
                    // 1. 일단 기본 DTO로 변환
                    StationDto dto = StationDto.fromEntity(entity, userLat, userLng);

                    // 2. [수정 추가] 이 충전소의 충전기들을 다 불러와서 개수 세기
                    List<com.simplecoding.chargerreservation.charger.entity.ChargerEntity> chargers =
                            chargerRepository.findByStatId(entity.getStatId());

                    // 3. [수정 추가] 전체 대수와 사용 가능 대수를 계산해서 DTO에 채우기
                    dto.setTotalCount(chargers.size());
                    long available = chargers.stream()
                            .filter(c -> "2".equals(c.getStat())) // "2"가 충전가능 상태일 때
                            .count();
                    dto.setAvailableCount((int) available);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * [기능] 충전소 상세 정보 단건 조회
     * - 특정 마커를 클릭했을 때 해당 충전소 1개의 상세 정보를 가져옵니다.
     * - 테스트 코드에서 호출하는 핵심 메서드입니다.
     */
    @Transactional(readOnly = true)
    public StationDto getStationDetail(String statId, Double userLat, Double userLng) {
        // ID로 조회하고 없으면 에러 처리
        StationEntity entity = stationRepository.findById(statId)
                .orElseThrow(() -> new RuntimeException("해당 충전소를 찾을 수 없습니다. ID: " + statId));

        // 엔티티를 DTO로 변환하여 반환
        return StationDto.fromEntity(entity, userLat, userLng);
    }

    /**
     * [기능] 충전소 통합 검색
     * - 검색어(키워드)를 입력받아 충전소명이나 주소 등에서 일치하는 데이터를 찾습니다.
     * - 좌표 기준이 아니므로 거리순 정렬보다는 매칭 결과 위주로 반환합니다.
     */
    @Transactional(readOnly = true)
    public List<StationDto> searchStations(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return List.of();

        List<StationEntity> entities = stationRepository.findByIntegratedSearch(keyword.trim());

        return entities.stream()
                .map(StationDto::fromEntity)
                .collect(Collectors.toList());
    }


    // ==========================================
    // 2. 수집 로직 (JdbcTemplate & Merge 활용)
    // ==========================================

    /**
     * 공공 API로부터 모든 충전소 데이터를 수집하여 DB에 MERGE
     */
    public void collectAllStationData() {
        String serviceKey = "6ebd5febab70800594860d7682eab328c14df15b1e1dfac30a7a011942ee6c3f";
        String url = "http://apis.data.go.kr/B552584/EvCharger/getChargerInfo";

        RestTemplate restTemplate = new RestTemplate();
        Set<String> statIdSet = new HashSet<>();
        List<JSONObject> buffer = new ArrayList<>();

        int pageNo = 1;
        int numOfRows = 5000;
        boolean hasMore = true;

        log.info("▶▶▶ [STATION] 수집 시작");

        while (hasMore) {
            try {
                URI uri = UriComponentsBuilder.fromHttpUrl(url)
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("pageNo", pageNo)
                        .queryParam("numOfRows", numOfRows)
                        .queryParam("dataType", "JSON")
                        .build(true)
                        .toUri();

                String response = restTemplate.getForObject(uri, String.class);

                if (response == null || !response.startsWith("{")) {
                    log.error("응답 오류 발생");
                    break;
                }

                JSONObject json = new JSONObject(response);
                JSONObject itemsObj = json.optJSONObject("items");
                if (itemsObj == null) { hasMore = false; break; }

                JSONArray items = itemsObj.optJSONArray("item");
                if (items == null || items.length() == 0) { hasMore = false; break; }

                for (int i = 0; i < items.length(); i++) {
                    JSONObject item = items.getJSONObject(i);
                    String statId = item.optString("statId", "").trim().toUpperCase().replaceAll("\\s+", "");

                    if (!statId.isEmpty() && !statIdSet.contains(statId)) {
                        statIdSet.add(statId);
                        buffer.add(item);
                    }
                }

                log.info("✔ {}페이지 완료 / 현재 누적 유니크 충전소: {}", pageNo, statIdSet.size());

                if (buffer.size() >= 5000) {
                    executeBatchMerge(buffer);
                    buffer.clear();
                }

                if (items.length() < numOfRows) hasMore = false;
                else pageNo++;

            } catch (Exception e) {
                log.error("!!! 수집 중 에러: {}", e.getMessage());
                break;
            }
        }

        if (!buffer.isEmpty()) executeBatchMerge(buffer);
        log.info("▶▶▶ [STATION] 총 {}건 수집 및 저장 완료", statIdSet.size());
    }

    /**
     * Oracle MERGE INTO Batch 실행
     */
    private void executeBatchMerge(List<JSONObject> list) {
        log.info(">>> DB MERGE 실행: {}건", list.size());

        String sql = "MERGE INTO STATION s USING DUAL ON (s.STAT_ID = ?) " +
                "WHEN MATCHED THEN UPDATE SET " +
                "s.STAT_NM=?, s.ADDR=?, s.LOCATION=?, s.LAT=?, s.LNG=?, " +
                "s.USE_TIME=?, s.BNM=?, s.ZCODE=?, s.ZSCODE=?, s.KIND=?, " +
                "s.PARKING_FREE=?, s.LIMIT_YN=?, s.LIMIT_DETAIL=? " +
                "WHEN NOT MATCHED THEN INSERT " +
                "(STAT_ID, STAT_NM, ADDR, LOCATION, LAT, LNG, USE_TIME, BNM, ZCODE, ZSCODE, KIND, PARKING_FREE, LIMIT_YN, LIMIT_DETAIL) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        jdbcTemplate.batchUpdate(sql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                JSONObject item = list.get(i);
                String sid = item.optString("statId", "").trim().toUpperCase().replaceAll("\\s+", "");

                // 파라미터 세팅 (1~14: ON 및 UPDATE / 15~28: INSERT)
                ps.setString(1, sid);
                ps.setString(2, item.optString("statNm", ""));
                ps.setString(3, item.optString("addr", ""));
                ps.setString(4, item.optString("location", ""));
                ps.setDouble(5, item.optDouble("lat", 0.0));
                ps.setDouble(6, item.optDouble("lng", 0.0));
                ps.setString(7, item.optString("useTime", ""));
                ps.setString(8, item.optString("bnm", ""));
                ps.setString(9, item.optString("zcode", ""));
                ps.setString(10, item.optString("zscode", ""));
                ps.setString(11, item.optString("kind", ""));

                String pfr = item.optString("parkingFree", "N").trim();
                ps.setString(12, pfr.length() > 1 ? pfr.substring(0, 1) : pfr);

                String lyn = item.optString("limitYn", "N").trim();
                ps.setString(13, lyn.length() > 1 ? lyn.substring(0, 1) : lyn);

                ps.setString(14, item.optString("limitDetail", ""));

                // INSERT용 동일 데이터 반복
                ps.setString(15, sid);
                ps.setString(16, item.optString("statNm", ""));
                ps.setString(17, item.optString("addr", ""));
                ps.setString(18, item.optString("location", ""));
                ps.setDouble(19, item.optDouble("lat", 0.0));
                ps.setDouble(20, item.optDouble("lng", 0.0));
                ps.setString(21, item.optString("useTime", ""));
                ps.setString(22, item.optString("bnm", ""));
                ps.setString(23, item.optString("zcode", ""));
                ps.setString(24, item.optString("zscode", ""));
                ps.setString(25, item.optString("kind", ""));
                ps.setString(26, pfr.length() > 1 ? pfr.substring(0, 1) : pfr);
                ps.setString(27, lyn.length() > 1 ? lyn.substring(0, 1) : lyn);
                ps.setString(28, item.optString("limitDetail", ""));
            }

            @Override
            public int getBatchSize() { return list.size(); }
        });
    }


}

