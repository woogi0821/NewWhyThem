package com.simplecoding.chargerreservation.charger.service;

import com.simplecoding.chargerreservation.charger.dto.MarkerDto;
import com.simplecoding.chargerreservation.charger.entity.ChargerEntity;
import com.simplecoding.chargerreservation.charger.repository.ChargerRepository;
import com.simplecoding.chargerreservation.station.entity.StationEntity;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Slf4j
@SpringBootTest
class ChargerServiceTest {

    @Autowired
    private ChargerService chargerService;

    @Autowired
    private ChargerRepository chargerRepository;

    @Test
    @Rollback(false) // 테스트 후 데이터를 남기고 싶으면 false, 지우고 싶으면 true
    @DisplayName("공공 API 충전기 데이터 수집 및 DB 저장 통합 테스트")
    void collectAllChargerDataTest() {
        log.info("========= [테스트 시작] 데이터 수집 및 MERGE 실행 =========");

        long startTime = System.currentTimeMillis();

        // 1. 수집 메서드 실행 (예외 발생 여부 체크)
        assertDoesNotThrow(() -> {
            chargerService.collectAllChargerData();
        }, "데이터 수집 중 SQL 에러나 API 통신 에러가 발생했습니다.");

        long endTime = System.currentTimeMillis();

        // 2. 결과 검증: DB에 데이터가 최소 1건 이상은 들어있어야 함
        long count = chargerRepository.count();
        log.info("▶ DB에 저장된 총 충전기 수: {}건", count);
        log.info("▶ 총 소요 시간: {}초", (endTime - startTime) / 1000.0);

        assertTrue(count > 0, "DB에 데이터가 하나도 저장되지 않았습니다. API 응답이나 SQL을 확인하세요.");

        log.info("========= [테스트 종료] 모든 검증 통과 =========");
    }

}