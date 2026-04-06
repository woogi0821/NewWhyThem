package com.simplecoding.chargerreservation.charger.service;

import com.simplecoding.chargerreservation.charger.repository.ChargerRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.Rollback;
import static org.assertj.core.api.Assertions.assertThat;

import static org.junit.jupiter.api.Assertions.*;

@Slf4j
@SpringBootTest
class ChargerServiceTest {

    @Autowired
    private ChargerService chargerService;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

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

    @Test
    @DisplayName("실제 API 호출 및 DB 반영 확인 테스트 (롤백 없음)")
    void updateRecentChargerStatusTest() {
        log.info(">>>>>> [테스트 시작] 최근 10분간 변동된 모든 데이터 수집");

        // 1. 서비스 호출
        // 이제 내부 while문에 의해 5,000건이 넘어도 모든 페이지를 다 가져옵니다.
        chargerService.updateRecentChargerStatus();

        log.info(">>>>>> [테스트 종료] 콘솔 로그에서 '총 OO건 동기화 완료' 문구를 확인하세요.");
    }
}