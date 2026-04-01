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

    private Integer availableCount;
    private Integer totalCount;
    private Double distance;        // [결과값] 내 위치로부터의 거리 (km)
    private List<ChargerDto> chargers;
    private String chargerType; // [추가] 급속, 완속, 또는 급속/완속 여부 표시용

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
     * Entity -> DTO 변환 + 거리 계산 로직 포함
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
     * 하버사인 공식 (Haversine Formula) - km 단위 거리 계산
     * 오라클 쿼리와의 오차를 최소화하기 위해 표준 공식을 사용합니다.
     */
    private static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        if (lat1 == lat2 && lon1 == lon2) return 0.0;

        double earthRadius = 6371.0; // 지구 반지름 (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double dist = earthRadius * c;

        // 소수점 둘째자리까지 반올림 (예: 1.25km)
        return Math.round(dist * 100.0) / 100.0;
    }

    /**
     * DTO -> Entity 변환
     */
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