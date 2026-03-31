package com.simplecoding.chargerreservation.station.dto;

import com.simplecoding.chargerreservation.station.entity.StationEntity;
import lombok.*;

/**
 * 전기차 충전소 데이터 전송 객체 (DTO)
 */
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

    // --- [추가] 프론트엔드 검색 및 시각화를 위한 필드 ---

    private Integer availableCount; // 현재 사용 가능한 충전기 수 (STAT='2'인 개수)
    private Integer totalCount;     // 해당 충전소의 전체 충전기 수
    private Double distance;        // 내 위치로부터의 거리 (단위: km)

    // --- [추가] Entity를 DTO로 변환하는 생성자 또는 메서드 ---
    /**
     * DB에서 가져온 Entity를 프론트에 보낼 DTO로 변환할 때 사용합니다.
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
     * DTO 데이터를 바탕으로 새로운 StationEntity 객체를 생성합니다.
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