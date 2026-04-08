package com.simplecoding.chargerreservation.reservation.service;

import com.simplecoding.chargerreservation.reservation.dto.ReservationDto;
import com.simplecoding.chargerreservation.reservation.entity.Reservation;
import com.simplecoding.chargerreservation.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
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

        return ReservationDto.Response.builder()
                .id(savedReservation.getId())
                .chargerId(savedReservation.getChargerId())
                .carNumber(savedReservation.getCarNumber())
                .reservationPin(savedReservation.getReservationPin())
                .startTime(savedReservation.getStartTime())
                .endTime(savedReservation.getEndTime())
                .status(savedReservation.getStatus())
                .isAlertSent(savedReservation.getIsAlertSent())
                .build();
    }
}
