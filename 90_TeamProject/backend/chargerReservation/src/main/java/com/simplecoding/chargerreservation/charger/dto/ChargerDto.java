package com.simplecoding.chargerreservation.charger.dto;

import lombok.*;

/**
 * CHARGER 테이블 명세에 맞춘 데이터 전송 객체 (DTO)
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargerDto {

    private String statId;      // STAT_ID: 충전소ID (VARCHAR2(40))
    private String chargerId;   // CHARGER_ID: 충전기ID (VARCHAR2(20))
    private String chargerType; // CHARGER_TYPE: 충전기 타입 코드 (VARCHAR2(20))
    private String stat;        // STAT: 충전기 상태 코드 (VARCHAR2(2))
    private String statUpdDt;   // STAT_UPD_DT: 상태갱신일시 (VARCHAR2(20))
    private Integer output;     // OUTPUT: 충전용량 (NUMBER(10))
    private String method;      // METHOD: 충전방식 (VARCHAR2(100))

    // 생성일/수정일은 보통 API 수집 시점에는 필요 없으나
    // 조회 시 필요할 수 있어 추가했습니다.
    private String createdAt;
    private String updatedAt;
}