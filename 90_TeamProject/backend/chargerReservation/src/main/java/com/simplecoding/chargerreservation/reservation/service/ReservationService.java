package com.simplecoding.chargerreservation.reservation.service;

import com.simplecoding.chargerreservation.reservation.dto.ReservationDto;
import com.simplecoding.chargerreservation.reservation.entity.Reservation;
import com.simplecoding.chargerreservation.reservation.repository.ReservationRepository;
import com.simplecoding.chargerreservation.websocket.ChargerSocketController;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;


@Log4j2
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChargerSocketController chargerSocketController;

    @Transactional
    public ReservationDto.Response createReservation(Long memberId, ReservationDto.Request req) {
        long activeCount = reservationRepository.countByMemberIdAndStatusIn(
                memberId, List.of("RESERVED" , "CHARGING")
        );
        //한개의 계정에서 2개 이상의 예약이 생길때 예외처리
        if (activeCount >= 2){
            throw  new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 2건의 활성 예약이 존재하여 더 이상 예약 할 수 없습니다.");
        }
        //급속 및 완속충전 종류에따라 시간 더하기
        int durationHours = "RAPID".equalsIgnoreCase(req.getChargerType())? 1 : 7;
        LocalDateTime calculatedEndTime = req.getStartTime().plusHours(durationHours);
        //시간 겹침 방지
        boolean isOverlapped = reservationRepository.existsOverlappingReservation(
                req.getChargerId(), req.getStartTime(), calculatedEndTime
        );
        if (isOverlapped) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"해당 시간에는 이미 다른 예약이 존재합니다.");
        }
        String generatedPin = String.format("%04d",(int)(Math.random()*10000));

        Reservation reservation = Reservation.builder()
                .memberId(memberId)
                .chargerId(req.getChargerId())
                .carNumber(req.getCarNumber())
                .reservationPin(generatedPin)
                .startTime(req.getStartTime())
                .endTime(calculatedEndTime)
                .status("RESERVED")
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);
        chargerSocketController.pushStatus(savedReservation.getChargerId(), "RESERVED");
        log.info("웹소켓 푸시 완료 - chargerId : {}, status : RESERVED", savedReservation.getChargerId());

        return ReservationDto.Response.builder()
                .id(savedReservation.getId())
                .chargerId(savedReservation.getChargerId())
                .carNumber(savedReservation.getCarNumber())
                .reservationPin(savedReservation.getReservationPin())
                .startTime(savedReservation.getStartTime())
                .endTime(savedReservation.getEndTime())
                .status(savedReservation.getStatus())
                .build();
    }

    //1분마다 만료된 예약 자동처리 (방치된 CHARGING 상태의 안전망)
    //해당 스케쥴이 필요한 이유 : 사용자가 충전종료 버튼을 누르지않고 이탈하는 케이스 대비
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireOverdueReservations() {
        LocalDateTime now = LocalDateTime.now();

        //END_TIME이 지난 CHARGING 상태 예약만 정밀조회 함수(인덱스의 활용,서버 부하 최소화)
        List<Reservation> overdueList = reservationRepository
                .findByStatusAndEndTimeBefore("CHARGING", now);
        if (overdueList.isEmpty()) return;
        for (Reservation reservation : overdueList){
            //endCharging()으로 상태변경 + actualEndTime 기록
            reservation.endCharging("COMPLETED", now);
            //키오스크 모킹화면에 AVAILABLE상태 푸시
            chargerSocketController.pushStatus(reservation.getChargerId(),"AVAILABLE");
            log.info("만료 예약 자동처리 - chargerId : {}, reservationId : {}",
                    reservation.getChargerId(), reservation.getId());
        }
    }
}
