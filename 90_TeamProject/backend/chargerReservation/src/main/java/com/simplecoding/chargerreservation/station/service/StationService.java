package com.simplecoding.chargerreservation.station.service;

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

    // ==========================================
    // 1. 조회 로직 (Repository & DTO 활용)
    // ==========================================

    /**
     * 반경 3km 이내의 충전소를 조회하여 마커 DTO 리스트로 반환
     */
    @Transactional(readOnly = true)
    public List<MarkerDto> getStationMarkers(Double lat, Double lng) {
        double radius = 3.0; // 3km 반경 고정

        // Repository의 하버사인 공식 쿼리 호출
        List<StationEntity> stations = stationRepository.findStationsWithinRadius(lat, lng, radius);

        log.info("▶ [STATION] 조회된 마커 개수: {}개 (기준 좌표: {}, {})", stations.size(), lat, lng);

        return stations.stream()
                .map(s -> new MarkerDto(
                        s.getStatId(),
                        s.getLat(),
                        s.getLng(),
                        "1" // 기본 상태값
                ))
                .collect(Collectors.toList());
    }

    /**
     * 충전소 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public StationDto getStationDetail(String statId) {
        StationEntity station = stationRepository.findById(statId)
                .orElseThrow(() -> new IllegalArgumentException("해당 충전소를 찾을 수 없습니다. ID: " + statId));

        return StationDto.builder()
                .statId(station.getStatId())
                .statNm(station.getStatNm())
                .addr(station.getAddr())
                .location(station.getLocation())
                .lat(station.getLat())
                .lng(station.getLng())
                .useTime(station.getUseTime())
                .bnm(station.getBnm())
                .zcode(station.getZcode())
                .zscode(station.getZscode())
                .kind(station.getKind())
                .parkingFree(station.getParkingFree())
                .limitYn(station.getLimitYn())
                .limitDetail(station.getLimitDetail())
                .build();
    }


    @Transactional(readOnly = true)
    public List<StationDto> searchStations(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        // 1. Repository에서 엔티티 리스트 조회
        List<StationEntity> entities = stationRepository.findByIntegratedSearch(keyword.trim());

        // 2. DTO에 이미 있는 [fromEntity] 메서드 사용!
        return entities.stream()
                .map(StationDto::fromEntity) // ◀ StationDto에 있는 메서드 이름으로 호출
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

// StationService 클래스 내부 어디든 상관없지만, 보통 맨 아래에 둡니다.

/**
 * [도움 메서드] Entity 객체를 DTO 객체로 변환합니다.
 * 이 메서드가 있어야 searchStations와 getStationDetail의 빨간 줄이 사라집니다.
 */
