package com.simplecoding.chargerreservation.charger.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.simplecoding.chargerreservation.charger.entity.ChargerEntity;
import lombok.*;

/**
 * 공공 API 응답 필드와 DB 컬럼 사이를 이어주는 DTO
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargerDto {

    @JsonProperty("statId")
    private String statId;      // STAT_ID

    @JsonProperty("chgerId")    // API: chgerId -> DB: CHARGER_ID
    private String chargerId;

    @JsonProperty("chgerType")  // API: chgerType -> DB: CHARGER_TYPE
    private String chargerType;

    @JsonProperty("stat")
    private String stat;        // STAT (2:사용가능, 3:충전중 등)

    @JsonProperty("statUpdDt")
    private String statUpdDt;   // STAT_UPD_DT (상태갱신일시)

    @JsonProperty("output")
    private Integer output;     // OUTPUT (충전용량)

    @JsonProperty("method")
    private String method;      // METHOD (충전방식)

    // --- 새로 추가된 실시간 상태 필드 시작 ---

    @JsonProperty("lastTsdt")
    private String lastTsdt;    // LAST_TSDT (마지막 충전 시작일시)

    @JsonProperty("lastTedt")
    private String lastTedt;    // LAST_TEDT (마지막 충전 종료일시)

    @JsonProperty("nowTsdt")
    private String nowTsdt;     // NOW_TSDT (현재 충전 시작일시)

    // --- 새로 추가된 실시간 상태 필드 끝 ---

    // DB 관리용 시간 (API 응답에는 없으므로 JsonProperty 생략)
    private String createdAt;
    private String updatedAt;

    public static ChargerDto fromEntity(ChargerEntity entity) {
        return ChargerDto.builder()
                .statId(entity.getStatId())
                .chargerId(entity.getChargerId())
                .chargerType(entity.getChargerType())
                .stat(entity.getStat())
                .method(entity.getMethod())
                .build();
    }
}