package com.simplecoding.chargerreservation.station.dto;

import com.simplecoding.chargerreservation.station.entity.StationEntity;
import com.simplecoding.chargerreservation.charger.dto.ChargerDto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class StationDto {

    private String statId;       // 1. 충전소 ID
    private String statNm;       // 2. 충전소명
    private String addr;         // 3. 주소
    private String location;     // 4. 상세위치
    private Double lat;          // 5. 위도
    private Double lng;          // 6. 경도
    private String useTime;      // 7. 이용시간
    private String bnm;          // 8. 운영기관명
    private String zcode;        // 9. 시도 코드
    private String zscode;       // 10. 구군 코드
    private String kind;         // 11. 충전소 구분
    private String parkingFree;  // 12. 주차료 무료 여부
    private String limitYn;      // 13. 이용 제한 여부
    private String limitDetail;  // 14. 제한 사유 상세

    private Integer availableCount; // 사용 가능 대수
    private Integer totalCount;     // 전체 대수
    private Integer brokenCount;    // [추가] 고장 대수
    private Double distance;        // 내 위치로부터의 거리 (km)
    private List<ChargerDto> chargers;
    private String chargerType;
    private String statSummary;     // [3단계] 하단 텍스트 (예: 2/4 (고장 1))

    private String markerColor;     // [1단계] 마커 색상 (green, amber, red, gray, black)
    private String warningLevel;    // [2단계] 주의 표시 (NONE, PARTIAL, TOTAL)
    private String occupancy;

    /**
     * Entity -> DTO 단순 변환
     */
    public static StationDto fromEntity(StationEntity entity) {
        return StationDto.builder()
                .statId(entity.getStatId())
                .statNm(entity.getStatNm())
                .addr(entity.getAddr())
                .location(entity.getLocation())
                .lat(entity.getLat())
                .lng(entity.getLng())
                .useTime(entity.getUseTime())
                .bnm(entity.getBnm())
                .zcode(entity.getZcode())
                .zscode(entity.getZscode())
                .kind(entity.getKind())
                .parkingFree(entity.getParkingFree())
                .limitYn(entity.getLimitYn())
                .limitDetail(entity.getLimitDetail())
                .build();
    }

    /**
     * Entity -> DTO 변환 + 거리 계산
     */
    public static StationDto fromEntity(StationEntity entity, Double userLat, Double userLng) {
        StationDto dto = fromEntity(entity);
        if (userLat != null && userLng != null && entity.getLat() != null && entity.getLng() != null) {
            double dist = calculateDistance(userLat, userLng, entity.getLat(), entity.getLng());
            dto.setDistance(dist);
        }
        return dto;
    }

    /**
     * [핵심] 1, 2, 3단계를 한 번에 계산하여 세팅하는 메서드
     * Service 단에서 호출하여 사용하세요.
     */
    public void setStatusInfo(int available, int total, int broken) {
        this.availableCount = available;
        this.totalCount = total;
        this.brokenCount = broken;

        // 1. [데이터 보정] 실제 가용 대수는 (전체 - 고장)을 초과할 수 없음
        // 예: 4대 중 1대 고장인데 가용이 4라고 오면, 3으로 깎아줍니다.
        int realAvailable = available;
        if (realAvailable + broken > total) {
            realAvailable = Math.max(0, total - broken);
        }

        // 보정된 값을 다시 필드에 저장 (정확한 화면 출력을 위해)
        this.availableCount = realAvailable;

        // 2. 가동 가능한 기기 대수 (색상 비율 계산용 분모)
        int activeTotal = Math.max(0, total - broken);

        // 3. 전체 고장 여부 판단 (TOTAL)
        // 1대 중 1대 고장이거나, 운영 가능한 기기가 0대인 경우
        if (total > 0 && (total == broken || activeTotal == 0)) {
            this.markerColor = "black";
            this.warningLevel = "TOTAL";
            this.statSummary = "점검 중";
        }
        // 4. 일부라도 가동 중인 기계가 있는 경우
        else if (total > 0) {
            this.warningLevel = (broken > 0) ? "PARTIAL" : "NONE";

            // [주의] 색상 판별 비율은 '실제 운영 가능한 대수' 대비 '가용 대수'로 계산해야 정확합니다.
            double rate = (activeTotal > 0) ? ((double) realAvailable / activeTotal) * 100 : 0;

            // 1단계: 마커 색상 결정
            if (realAvailable == 0) this.markerColor = "gray";       // 만차
            else if (rate >= 70) this.markerColor = "green";    // 여유
            else if (rate >= 30) this.markerColor = "amber";    // 보통
            else this.markerColor = "red";                      // 혼잡

            // [핵심] 3단계: 텍스트 구성 (질문자님 요청 방식: 3/4 (고장 1))
            // 분모를 activeTotal이 아닌 'total'로 사용합니다.
            this.statSummary = (broken > 0)
                    ? String.format("%d / %d (고장 %d)", realAvailable, total, broken)
                    : String.format("%d / %d", realAvailable, total);
        }
        // 5. 데이터 확인 불가
        else {
            this.markerColor = "gray";
            this.statSummary = "확인불가";
            this.warningLevel = "NONE";
        }
    }
    /**
     * 거리 계산 (Haversine Formula)
     */
    private static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        if (lat1 == lat2 && lon1 == lon2) return 0.0;
        double earthRadius = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double dist = earthRadius * c;
        return Math.round(dist * 100.0) / 100.0;
    }

    public StationEntity toEntity() {
        return StationEntity.builder()
                .statId(this.statId)
                .statNm(this.statNm)
                .addr(this.addr)
                .location(this.location)
                .lat(this.lat)
                .lng(this.lng)
                .useTime(this.useTime)
                .bnm(this.bnm)
                .zcode(this.zcode)
                .zscode(this.zscode)
                .kind(this.kind)
                .parkingFree(this.parkingFree)
                .limitYn(this.limitYn)
                .limitDetail(this.limitDetail)
                .build();
    }
}