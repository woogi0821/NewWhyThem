package com.simplecoding.chargerreservation.reservation.service;

import com.simplecoding.chargerreservation.reservation.dto.KioskDto;
import com.simplecoding.chargerreservation.reservation.entity.Reservation;
import com.simplecoding.chargerreservation.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class KioskService {

    private final ReservationRepository reservationRepository;

    @Transactional
    public void startCharging(KioskDto.AuthRequest req) {
        Reservation reservation = reservationRepository.findByChargerIdAndStatusAndReservationPin(
                req.getChargerId(),"RESERVED", req.getPin()
        ).orElseThrow(()-> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"핀번호가 일치하지 않거나 유효한 예약이 없습니다."));
        reservation.changeStatus("CHARGING");
    }
}
