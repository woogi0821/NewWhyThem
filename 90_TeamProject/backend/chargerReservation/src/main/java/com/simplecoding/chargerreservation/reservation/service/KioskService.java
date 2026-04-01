package com.simplecoding.chargerreservation.reservation.service;

import com.simplecoding.chargerreservation.reservation.dto.KioskDto;
import com.simplecoding.chargerreservation.reservation.entity.Reservation;
import com.simplecoding.chargerreservation.reservation.repository.ReservationRepository;
import com.simplecoding.chargerreservation.websocket.ChargerSocketController;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Log4j2
@Service
@RequiredArgsConstructor
public class KioskService {

    private final ReservationRepository reservationRepository;
    private final ChargerSocketController chargerSocketController;

    @Transactional
    public void startCharging(KioskDto.AuthRequest req) {
        Reservation reservation = reservationRepository.findByChargerIdAndStatusAndReservationPin(
                req.getChargerId(),"RESERVED", req.getPin()
        ).orElseThrow(()-> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"핀번호가 일치하지 않거나 유효한 예약이 없습니다."));
        reservation.changeStatus("CHARGING");

        chargerSocketController.pushStatus(req.getChargerId(),"CHARGING");
        log.info("웹소켓 푸시 완료 - chargerId : {}, status : CHARGING", req.getChargerId());
    }
    //충전 종료 버튼 -> 실제 종료 시각 기록 + 상태변경
    //물리적으로 충전기를 뽑는 행위를 버튼으로 표현
    @Transactional
    public void stopCharging(KioskDto.StopRequest req){
        Reservation reservation = reservationRepository
                .findByChargerIdAndStatusAndReservationPin(req.getChargerId(),"CHARGING", req.getPin()
                ).orElseThrow(()-> new ResponseStatusException(HttpStatus.BAD_REQUEST,"진행중인 충전이 없거나 핀번호가 일치하지 않습니다."));
        //endCharging()으로 상태 + actualEndTime 동시 기록
        reservation.endCharging("COMPLETED", LocalDateTime.now());

    }
}
