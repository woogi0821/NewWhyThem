package com.simplecoding.chargerreservation.charger.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MarkerDto {
    private String statId; // 충전소 ID
    private double lat;    // 위도
    private double lng;    // 경도
    private String stat;   // 상태 (2:가능, 3:충전중 등 - 마커 색상 결정용)
}