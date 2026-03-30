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
    private String bnm;          // 8. 운영기관명 (기관명)
    private String zcode;        // 9. 시도 코드
    private String zscode;       // 10. 구군 코드
    private String kind;         // 11. 충전소 구분
    private String parkingFree;  // 12. 주차료 무관 여부 (Y/N)
    private String limitYn;      // 13. 이용 제한 여부 (Y/N)
    private String limitDetail;  // 14. 제한 사유 상세

    // --- 추가 추천: Entity 변환 메서드 ---
    /**
     * DTO 데이터를 바탕으로 새로운 StationEntity 객체를 생성합니다.
     * 스케줄러에서 '신규 등록(Insert)' 시 사용됩니다.
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