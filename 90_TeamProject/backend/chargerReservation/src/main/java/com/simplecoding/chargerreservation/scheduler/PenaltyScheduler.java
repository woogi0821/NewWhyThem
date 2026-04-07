package com.simplecoding.chargerreservation.scheduler;


import com.simplecoding.chargerreservation.penalty.service.SmsService;
import com.simplecoding.chargerreservation.reservation.entity.Reservation;
import com.simplecoding.chargerreservation.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor // Repository와 Service를 자동으로 연결해줍니다.
public class PenaltyScheduler {

    private final ReservationRepository reservationRepository;
    private final SmsService smsService;
    // 매 분 0초마다 실행 (초 분 시 일 월 요일)
    @Scheduled(cron = "0 * * * * *")
    public void checkNoShowAndCancel() {
        LocalDateTime now = LocalDateTime.now();
        // [STEP 1] 1분 경과자 찾아서 문자 보내기
        // 현재 시간보다 1분 전이 시작 시간인 'RESERVED' 상태의 'N'인 사람들 조회
        List<Reservation> alertTargets = reservationRepository.findNoShowAlertTargets(now.minusMinutes(1));

        for (Reservation res : alertTargets) {
            // 1. 문자 발송 (지환님이 만든 서비스 호출)
            smsService.sendPenaltyMessage(
                    res.getUserPhone(), // 만약 엔티티에 폰번호가 없다면 Member 연관관계에서 가져와야 함
                    res.getUserName(),
                    "예약 시간 1분 경과 알림",
                    "10분 내 미충전 시 자동 취소됩니다."
            );

            // 2. 중요! 다시는 안 보내게 'Y'로 업데이트
            res.setIsAlertSent("Y");
            reservationRepository.save(res); // DB에 저장

            log.info("✅ {}님에게 1분 경과 알림 발송 완료", res.getUserName());
        }
    }
}
