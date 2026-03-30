package com.simplecoding.chargerreservation.station.scheduler;

import com.simplecoding.chargerreservation.station.service.StationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StationScheduler {

    private final StationService stationService;

    // 10분마다 위 서비스의 collectAllStationData를 호출함
    @Scheduled(fixedDelay = 600000)
    public void runStationSync() {
        log.info("⏰ [SCHEDULER] 자동 업데이트 시작");
        stationService.collectAllStationData();
        log.info("✅ [SCHEDULER] 자동 업데이트 완료");
    }
}