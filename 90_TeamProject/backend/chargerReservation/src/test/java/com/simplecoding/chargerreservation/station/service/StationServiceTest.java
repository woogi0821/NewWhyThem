package com.simplecoding.chargerreservation.station.service;

import com.simplecoding.chargerreservation.charger.dto.MarkerDto;
import com.simplecoding.chargerreservation.charger.entity.ChargerEntity;
import com.simplecoding.chargerreservation.station.dto.StationDto;
import com.simplecoding.chargerreservation.station.entity.StationEntity;
import com.simplecoding.chargerreservation.station.repository.StationRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.within;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
@Log4j2
@SpringBootTest
class StationServiceTest {

    @Autowired
    private StationService stationService;
    @Autowired
    private StationRepository stationRepository;

    @Test
    @DisplayName("1. 공공 데이터 수집 테스트 (API -> DB)")
    void collectDataTest() {
        // 실행: API를 호출하여 DB에 충전소 정보를 MERGE 합니다.
        // 데이터가 많으므로 시간이 다소 걸릴 수 있습니다 (약 1~2분)
        stationService.collectAllStationData();
    }

    @Test
    @DisplayName("2. 하단역 기준 반경 3km 마커 조회 테스트 (페이징 적용)")
    void getStationMarkersAtHadan() {
        // 1. Given: 좌표 설정 (현재 코드는 양정역 좌표네요! 하단역으로 바꾸셔도 됩니다)
        Double lat = 35.173127;
        Double lng = 129.071331;
        int page = 0; // ★ 첫 번째 페이지(가장 가까운 20개) 요청

        // 2. When: 서비스 호출 (파라미터에 page 추가)
        List<MarkerDto> markers = stationService.getStationMarkers(lat, lng, page);

        // 3. Then: 검증 및 결과 출력
        System.out.println("======================================");
        System.out.println("📍 조회 기준: " + lat + ", " + lng);
        System.out.println("조회된 마커 개수 (현재 페이지): " + markers.size() + "개");
        System.out.println("======================================");

        // 페이징 결과 검증
        assertThat(markers).isNotEmpty();
        // 한 페이지당 20개씩 가져오기로 했으므로, 데이터가 충분하다면 20개여야 함
        assertThat(markers.size()).isLessThanOrEqualTo(20);

        MarkerDto firstMarker = markers.get(0);
        assertThat(firstMarker.getStatId()).isNotNull();
        assertThat(firstMarker.getLat()).isCloseTo(lat, org.assertj.core.api.Assertions.within(0.1));
    }


    @Test
    @DisplayName("충전소 통합 검색 테스트 (이름/주소/운영사)")
    void searchStations() {
        // 1. Given (준비)
        // DB에 "강남" 또는 "환경공단" 등이 포함된 데이터가 있다고 가정
        String keyword = "환경부";

        // 2. When (실행)
        List<StationDto> results = stationService.searchStations(keyword);

        // 3. Then (검증)
        // 결과가 null이 아니어야 함
        assertThat(results).isNotNull();

        // 검색 결과가 있다면, 각 항목에 키워드가 포함되어 있는지 확인
        if (!results.isEmpty()) {
            log.info("▶ 검색 결과 개수: {}건", results.size());
            results.forEach(dto -> {
                boolean match = dto.getStatNm().contains(keyword) ||
                        dto.getAddr().contains(keyword) ||
                        dto.getBnm().contains(keyword);

                assertThat(match).isTrue();
                log.info("✔ 검색 일치 확인: {}", dto.getStatNm());
            });
        } else {
            log.warn("⚠ DB에 '{}' 키워드가 포함된 데이터가 없습니다. 수집을 먼저 진행하세요.", keyword);
        }
    }

    @Test
    @DisplayName("빈 키워드 검색 시 빈 리스트 반환 테스트")
    void searchStationsEmpty() {
        // Given
        String keyword = "   "; // 공백 검색

        // When
        List<StationDto> results = stationService.searchStations(keyword);

        // Then
        assertThat(results).isEmpty();
    }

    @Test
    @DisplayName("상세조회 통합 검증: 데이터 로드 + 거리 계산 + 충전기 상태")
    void getStationDetailTest() {
        // 1. [준비] 기준 데이터 설정
        String targetStatId = "KP002210"; // 홈플러스 서면점
        Double myLat = 35.1485;         // 범내골역 위도
        Double myLng = 129.0637;         // 범내골역 경도

        // 2. [실행] 서비스 호출
        StationDto detail = stationService.getStationDetail(targetStatId, myLat, myLng);

        // 3. [검증 및 로그 확인]
        log.info("====================================================");
        log.info("▶ 충전소명: {}", detail.getStatNm());
        log.info("▶ 주소: {}", detail.getAddr());
        log.info("▶ 내 위치로부터의 거리: {}km", detail.getDistance());

        if (detail.getChargers() != null && !detail.getChargers().isEmpty()) {
            log.info("▶ 연결된 충전기 개수: {}대", detail.getChargers().size());
            detail.getChargers().forEach(c ->
                    log.info("   - [충전기 {}] 상태: {} (2:가능, 3:충전중)", c.getChargerId(), c.getStat())
            );
        } else {
            log.warn("▶ 주의: 해당 충전소에 연결된 충전기 데이터가 없습니다.");
        }
        log.info("====================================================");

        // Assertions (단언문)
        assertThat(detail).isNotNull();
        assertThat(detail.getStatId()).isEqualTo(targetStatId);

        // 거리가 0.11km 근처인지 확인 (오차 범위 감안)
        assertThat(detail.getDistance()).isCloseTo(0.11, within(0.01));

        // 충전기 리스트가 담겨있는지 확인
        assertThat(detail.getChargers()).isNotNull();
    }

    @Test
    @DisplayName("내 위치(하단역) 기준 반경 1.5km 충전소 20개 조회 테스트")
    void getStationsWithDistancePaged_HadanStation() {
        // [1] Given: 하단역 좌표 설정 (내 위치)
        Double userLat = 35.1061;
        Double userLng = 128.9665;
        int page = 0;

        // [2] When: 서비스 호출 (반경 1.5km 로직 실행)
        List<StationDto> result = stationService.getStationsWithDistancePaged(userLat, userLng, page);

        // [3] Then: 결과 검증 및 출력
        log.info("====================================================");
        log.info("📍 기준 위치: 부산 하단역 (35.1061, 128.9665)");
        log.info("🔎 검색 결과: {}건 발견", result.size());
        log.info("====================================================");

        if (result.isEmpty()) {
            log.warn("⚠️ 하단역 반경 1.5km 내에 검색된 충전소가 없습니다. DB 데이터를 확인하세요.");
        } else {
            result.forEach(dto -> {
                log.info("[{}] {} | 거리: {}km | 상태: {} / {}",
                        result.indexOf(dto) + 1,        // 순번 (가까운 순)
                        dto.getStatNm(),                // 충전소 이름
                        String.format("%.2f", dto.getDistance()), // 거리 (소수점 2자리)
                        dto.getAvailableCount(),        // 사용 가능 대수
                        dto.getTotalCount()             // 전체 대수
                );
            });
        }

        // 결과가 있다면 첫 번째 데이터가 가장 가까운 것이어야 함
        if (!result.isEmpty()) {
            assertThat(result.get(0).getDistance()).isLessThanOrEqualTo(1.5);
        }
    }
}