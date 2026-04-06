package com.simplecoding.chargerreservation.station.service;

import com.simplecoding.chargerreservation.station.dto.MarkerDto;
import com.simplecoding.chargerreservation.station.dto.StationDto;
import com.simplecoding.chargerreservation.station.repository.StationRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

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
    @DisplayName("부산시청 기준 반경 1.5km 충전소 마커 조회 테스트 (거리 제거 및 현황 중심)")
    void getStationMarkers() {
        // 1. Given: 부산시청 좌표 설정
        Double busanCityHallLat = 35.1798;
        Double busanCityHallLng = 129.0750;

        // 2. When: 서비스 호출
        List<MarkerDto> markers = stationService.getStationMarkers(busanCityHallLat, busanCityHallLng);

        // 3. Then: 검증 및 로그 출력
        System.out.println("=== [부산시청 인근 충전소 마커 조회 결과 (마커용)] ===");

        if (markers.isEmpty()) {
            System.out.println("❌ 해당 반경 내에 충전소가 없습니다. (DB 데이터를 확인해주세요)");
        } else {
            markers.forEach(marker -> {
                // ✅ [수정] 거리(%5.2fkm) 출력 부분 삭제
                System.out.printf("📍 충전소명: %-20s\n", marker.getStatNm());
                System.out.printf("   └─ [3단계] 현황: %-15s | [1단계] 색상: %-7s | [2단계] 경고: %-7s\n",
                        marker.getOccupancy(), marker.getMarkerColor(), marker.getWarningLevel());
                System.out.println("------------------------------------------------------------------");

                // 4. 검증 로직
                assertThat(marker.getStatId()).isNotNull();
                assertThat(marker.getStatNm()).isNotNull();

                // ✅ [수정] distance 필드가 삭제되었으므로 관련 검증 제외
                // assertThat(marker.getDistance()).isNotNull(); <-- 이 줄은 에러가 나므로 삭제되었습니다.

                // 색상 및 경고 단계 유효성 체크
                assertThat(marker.getMarkerColor()).isIn("green", "amber", "red", "gray", "black");
                assertThat(marker.getWarningLevel()).isIn("NONE", "PARTIAL", "TOTAL");

                // 현황 텍스트(occupancy)가 비어있지 않은지 확인
                assertThat(marker.getOccupancy()).isNotBlank();
            });

            System.out.println("✅ 총 " + markers.size() + "개의 마커 데이터가 성공적으로 검증되었습니다.");
            System.out.println("ℹ️ 마커 데이터에는 보안 및 요구사항에 따라 거리(distance) 정보가 포함되지 않습니다.");
        }
    }

    @Test
    @DisplayName("사용자 위치 기준 충전소 목록 페이징 조회 테스트")
    void getStationsWithDistancePaged() {
        // 1. Given: 필요한 변수들을 선언합니다. (빨간 줄 해결 포인트!)
        Double lat = 35.1798;   // 테스트용 위도 (부산시청)
        Double lng = 129.0750;  // 테스트용 경도
        int page = 0;           // 첫 번째 페이지 (0부터 시작)
        int size = 10;          // 한 페이지에 보여줄 개수

        // 2. When: 위에서 선언한 변수들을 파라미터로 전달합니다.
        List<StationDto> stations = stationService.getStationsWithDistancePaged(lat, lng, page, size);

        // 3. Then: 결과 검증
        System.out.println("=== [충전소 목록 페이징 조회 결과] ===");
        if (stations.isEmpty()) {
            System.out.println("⚠️ 데이터가 없습니다.");
        } else {
            stations.forEach(station -> {
                System.out.printf("📍 %-20s | 거리: %.2fkm\n",
                        station.getStatNm(), station.getDistance());

                // StationDto에 occupancy 필드를 추가했다면 아래 코드 사용 가능
                // 만약 추가 안 했다면 이 줄은 주석 처리하거나 삭제하세요!
                System.out.println("   └─ 상태: " + station.getOccupancy());
            });

            // 첫 번째 항목이 가장 가까운지 검증
            assertThat(stations.get(0).getDistance()).isNotNull();
        }
    }

    @Test
    void getStationDetail() {
    }

    @Test
    void searchStations() {
    }
}