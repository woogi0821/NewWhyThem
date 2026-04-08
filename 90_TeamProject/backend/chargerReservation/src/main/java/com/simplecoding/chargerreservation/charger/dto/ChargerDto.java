package com.simplecoding.chargerreservation.charger.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
<<<<<<< HEAD
import lombok.*;

/**
 * 공공 API 응답 필드와 DB 컬럼 사이를 이어주는 DTO
 */
=======
import com.simplecoding.chargerreservation.charger.entity.ChargerEntity;
import lombok.*;

import java.util.Map;
import java.util.Set;

>>>>>>> origin/Test_Table
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargerDto {

<<<<<<< HEAD
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
=======
    // 1. 메모리 최적화: 급속 타입 코드를 상수로 선언 (객체 재생성 방지)
    private static final Set<String> FAST_TYPES = Set.of("01", "03", "04", "05", "06", "08");

    // 2. 편의성: 충전기 상태 코드를 한글 텍스트로 매핑
    private static final Map<String, String> STAT_LABELS = Map.of(
            "1", "통신이상", "2", "충전대기", "3", "충전중",
            "4", "운영중단", "5", "점검중", "9", "상태미확인"
    );

    @JsonProperty("statId")
    private String statId;

    @JsonProperty("chgerId")
    private String chargerId;

    @JsonProperty("chgerType")
    private String chargerType;

    @JsonProperty("stat")
    private String stat;

    private String statNm;        // "충전중", "대기중" 등 한글명 추가

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

    private String chargerTypeNm;
    private boolean isFast;

    /**
     * Entity -> DTO 변환
     */
    public static ChargerDto fromEntity(ChargerEntity entity) {
        if (entity == null) return null;

        String typeCode = entity.getChargerType();
        // 미리 정의된 상수를 사용하여 메모리 사용량 절감
        boolean fast = FAST_TYPES.contains(typeCode);

        return ChargerDto.builder()
                .statId(entity.getStatId())
                .chargerId(entity.getChargerId())
                .chargerType(typeCode)
                .stat(entity.getStat())
                // 상태 코드를 한글명으로 변환해서 저장
                .statNm(STAT_LABELS.getOrDefault(entity.getStat(), "정보없음"))
                .statUpdDt(entity.getStatUpdDt())
                .output(entity.getOutput())
                .method(entity.getMethod())
                .lastTsdt(entity.getLastTsdt())
                .lastTedt(entity.getLastTedt())
                .nowTsdt(entity.getNowTsdt())
                .isFast(fast)
                .chargerTypeNm(fast ? "급속" : "완속")
                .build();
    }
>>>>>>> origin/Test_Table
}