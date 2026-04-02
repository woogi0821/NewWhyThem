package com.simplecoding.chargerreservation.station.service;

import com.simplecoding.chargerreservation.charger.dto.MarkerDto;
import com.simplecoding.chargerreservation.station.dto.StationDto;
import com.simplecoding.chargerreservation.station.repository.StationRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.within;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
    @DisplayName("실제 DB 기반 범내골역 주변 1.5km 마커 100개 조회")
    void getStationMarkersRealDbTest() {
        // 1. Given: 범내골역 좌표 (부산광역시 부산진구 범천동)
        Double beomnaegolLat = 35.1461;
        Double beomnaegolLng = 129.0591;

        // 2. When: 서비스 호출 (실제 DB 쿼리 실행)
        List<MarkerDto> result = stationService.getStationMarkers(beomnaegolLat, beomnaegolLng);

        // 3. Then: 검증 및 결과 출력
        assertNotNull(result, "결과 리스트가 null이 아니어야 합니다.");

        System.out.println("==========================================");
        System.out.println("📍 범내골역 기준 조회 결과");
        System.out.println("🔎 검색된 마커 개수: " + result.size());

        if (!result.isEmpty()) {
            for (int i = 0; i < Math.min(result.size(), 5); i++) { // 상위 5개만 출력
                MarkerDto marker = result.get(i);
                System.out.printf("[%d] ID: %s | 위도: %.6f | 경도: %.6f%n",
                        i + 1, marker.getStatId(), marker.getLat(), marker.getLng());
            }
        } else {
            System.out.println("⚠️ 검색 결과가 없습니다. DB에 범내골역 인근 데이터를 확인하세요.");
        }
        System.out.println("==========================================");

        // 100개 이하로 가져오는지 확인 (쿼리에 limit 100이 잘 걸렸는지)
        assertTrue(result.size() <= 100, "마커는 최대 100개까지만 조회되어야 합니다.");
    }
    @Test
    @DisplayName("실제 DB 기반 서면역 주변 1.5km 리스트 20개 페이징 조회")
    void getStationsWithDistancePaged() {
        // Given: 해운대구청 좌표
        Double userLat = 35.16316;
        Double userLng = 129.16385;
        int page = 0;

        // When: 서면역 중심 1.5km 반경 20개 조회
        List<StationDto> result = stationService.getStationsWithDistancePaged(userLat, userLng, page);

        // Then: 검증
        assertNotNull(result);
        // 데이터가 있다면 최대 20개까지만 나와야 함
        assertTrue(result.size() <= 20);

        System.out.println("==========================================");
        System.out.println("📍 서면역 기준 리스트 조회 결과 (Page: " + page + ")");
        System.out.println("🔎 검색된 데이터 개수: " + result.size());

        if (!result.isEmpty()) {
            for (int i = 0; i < result.size(); i++) {
                StationDto dto = result.get(i);
                System.out.printf("[%d] 명칭: %-15s | 거리: %.2fkm | 상태: %-10s | 타입: %s%n",
                        (page * 20) + i + 1,
                        dto.getStatNm(),
                        dto.getDistance(),
                        dto.getStatSummary(), // "5 / 15" 형태
                        dto.getChargerType()  // "급속/완속" 등
                );

                // 거리순 정렬 검증 (이전 항목보다 거리가 멀거나 같아야 함)
                if (i > 0) {
                    assertTrue(result.get(i).getDistance() >= result.get(i - 1).getDistance(),
                            "거리순으로 정렬되지 않았습니다.");
                }
            }
        }
        System.out.println("==========================================");
    }
}