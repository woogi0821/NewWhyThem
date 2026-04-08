package com.simplecoding.chargerreservation.station.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.simplecoding.chargerreservation.charger.dto.ChargerDto;
import com.simplecoding.chargerreservation.chargerPrice.dto.ChargerPriceDto;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StationDto {

    // --- 기본 필드 (Entity와 1:1 매핑) ---
    private String statId;
    private String statNm;
    private String addr;
    private String location;
    private Double lat;
    private Double lng;
    private String useTime;
    private String bnm;
    private String zcode;
    private String zscode;
    private String kind;
    private String parkingFree;
    private String limitYn;
    private String limitDetail;

    // --- 계산 및 상태 필드 ---
    private Integer availableCount;
    private Integer totalCount;
    private Integer brokenCount;
    private Double distance;
    private List<ChargerDto> chargers;
    private String statSummary;     // 마커용 요약
    private String markerColor;
    private String warningLevel;
    private String occupancy;

    // --- 변환 필드 (MapStruct가 채워줄 예정) ---
    private String parkingInfo;     // "무료주차" 또는 "유료주차"
    private String openStatus;      // "개방" 또는 "미개방(사유)"
    private String fastChargerStatus;
    private String slowChargerStatus;

    // --- [신규] 요금 정보 필드 ---
    private Double currentPrice;
    private ChargerPriceDto priceDetail;

    /**
     * 상태 및 마커 정보 세팅 (계산 로직만 유지)
     */
    public void setStatusInfo(int available, int total, int broken) {
        this.availableCount = Math.max(0, (available + broken > total) ? total - broken : available);
        this.totalCount = total;
        this.brokenCount = broken;

        int activeTotal = Math.max(0, total - broken);
        if (total > 0 && (total == broken || activeTotal == 0)) {
            this.markerColor = "black";
            this.warningLevel = "TOTAL";
            this.statSummary = "점검 중";
        } else if (total > 0) {
            this.warningLevel = (broken > 0) ? "PARTIAL" : "NONE";
            double rate = (activeTotal > 0) ? ((double) this.availableCount / activeTotal) * 100 : 0;

            if (this.availableCount == 0) this.markerColor = "gray";
            else if (rate >= 70) this.markerColor = "green";
            else if (rate >= 30) this.markerColor = "amber";
            else this.markerColor = "red";

            this.statSummary = (broken > 0)
                    ? String.format("%d/%d (고장%d)", this.availableCount, total, broken)
                    : String.format("%d/%d", this.availableCount, total);
        } else {
            this.markerColor = "gray";
            this.statSummary = "확인불가";
            this.warningLevel = "NONE";
        }

        // ⭐ [추가] 테스트 코드에서 검증하는 occupancy 필드에 값을 채워줍니다.
        this.occupancy = this.statSummary;
    }

    public void setTypeDetailStatus(String type, int available, int total, int broken) {
        String statusText = (broken > 0) ? String.format("%s %d/%d (고장%d)", type, available, total, broken) : String.format("%s %d/%d", type, available, total);
        if ("급속".equals(type)) this.fastChargerStatus = statusText;
        else if ("완속".equals(type)) this.slowChargerStatus = statusText;
    }

    /**
     * 프론트엔드에서 호출할 요금 표시용 메서드
     */
    public String getPriceDisplayText() {
        if (this.currentPrice == null || this.currentPrice <= 0) {
            return "현장에서 확인하세요";
        }
        return String.format("%.1f원/kWh", this.currentPrice);
    }
}