package com.simplecoding.chargerreservation.charger.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.simplecoding.chargerreservation.charger.entity.ChargerEntity;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargerDto {

    @JsonProperty("statId")
    private String statId;

    @JsonProperty("chgerId")
    private String chargerId;

    @JsonProperty("chgerType")
    private String chargerType;

    @JsonProperty("stat")
    private String stat;

    @JsonProperty("statUpdDt")
    private String statUpdDt;

    @JsonProperty("output")
    private Integer output;

    @JsonProperty("method")
    private String method;

    @JsonProperty("lastTsdt")
    private String lastTsdt;

    @JsonProperty("lastTedt")
    private String lastTedt;

    @JsonProperty("nowTsdt")
    private String nowTsdt;

    private String createdAt;
    private String updatedAt;

    /**
     * Entity -> DTO 변환
     * 누락되었던 실시간 상태 필드들을 추가했습니다.
     */
    public static ChargerDto fromEntity(ChargerEntity entity) {
        if (entity == null) return null;
        return ChargerDto.builder()
                .statId(entity.getStatId())
                .chargerId(entity.getChargerId())
                .chargerType(entity.getChargerType())
                .stat(entity.getStat())
                .statUpdDt(entity.getStatUpdDt()) // 추가
                .output(entity.getOutput())       // 추가
                .method(entity.getMethod())
                .lastTsdt(entity.getLastTsdt())   // 추가
                .lastTedt(entity.getLastTedt())   // 추가
                .nowTsdt(entity.getNowTsdt())     // 추가
                .build();
    }
}