package com.simplecoding.chargerreservation.station.service;

import com.simplecoding.chargerreservation.charger.dto.MarkerDto;
import com.simplecoding.chargerreservation.station.dto.StationDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class StationServiceTest {

    @Autowired
    private StationService stationService;

    @Test
    @DisplayName("1. 공공 데이터 수집 테스트 (API -> DB)")
    void collectDataTest() {
        // 실행: API를 호출하여 DB에 충전소 정보를 MERGE 합니다.
        // 데이터가 많으므로 시간이 다소 걸릴 수 있습니다 (약 1~2분)
        stationService.collectAllStationData();
    }

    @Test
    @DisplayName("2. 범내골역 기준 반경 3km 마커 조회 테스트")
    void getStationMarkers() {
        // 1. Given: 범내골역 좌표 설정
        Double lat = 35.1485;
        Double lng = 129.0637;

        // 2. When: 서비스 호출
        List<MarkerDto> markers = stationService.getStationMarkers(lat, lng);

        // 3. Then: 검증 및 결과 출력
        System.out.println("======================================");
        System.out.println("조회된 마커 총 개수: " + markers.size() + "개");
        System.out.println("======================================");

        // 결과가 존재하는지 확인
        assertThat(markers).isNotEmpty();

        // 첫 번째 마커 데이터 유효성 검사
        MarkerDto firstMarker = markers.get(0);
        assertThat(firstMarker.getStatId()).isNotNull();
        assertThat(firstMarker.getLat()).isEqualTo(lat, org.assertj.core.data.Offset.offset(0.1));
    }

    @Test
    @DisplayName("3. 특정 충전소 상세 정보 조회 테스트")
    void getStationDetailTest() {
        // 1. Given: DB에 존재하는 실제 statId 하나를 지정합니다.
        // (앞선 테스트에서 243개가 조회되었으므로, 그 중 하나를 사용하거나
        // 수집된 데이터 중 확실히 존재하는 ID를 넣으세요.)
        String targetStatId = "ME178107"; // 예시 ID (본인 DB에 있는 ID로 변경 가능)

        try {
            // 2. When: 상세 정보 조회 서비스 호출
            StationDto detail = stationService.getStationDetail(targetStatId);

            // 3. Then: 데이터 검증 및 출력
            System.out.println("======================================");
            System.out.println("🔎 충전소명: " + detail.getStatNm());
            System.out.println("📍 주소: " + detail.getAddr());
            System.out.println("⏰ 이용시간: " + detail.getUseTime());
            System.out.println("🅿 주차무료 여부: " + detail.getParkingFree());
            System.out.println("🚫 이용제한: " + detail.getLimitDetail());
            System.out.println("======================================");

            // 핵심 필드들이 비어있지 않은지 확인
            assertThat(detail).isNotNull();
            assertThat(detail.getStatId()).isEqualTo(targetStatId);
            assertThat(detail.getStatNm()).isNotEmpty();

        } catch (IllegalArgumentException e) {
            // 데이터가 없는 경우 에러 메시지 확인
            System.out.println("❌ 테스트 실패: " + e.getMessage());
            throw e;
        }
    }

}