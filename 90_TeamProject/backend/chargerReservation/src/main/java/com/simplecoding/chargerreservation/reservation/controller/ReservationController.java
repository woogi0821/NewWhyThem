package com.simplecoding.chargerreservation.reservation.controller;

import com.simplecoding.chargerreservation.reservation.dto.ReservationDto;
import com.simplecoding.chargerreservation.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Log4j2
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationDto.Response> createReservation(
            @RequestHeader("X-MemberId") Long memberId,
            @Valid @RequestBody ReservationDto.Request req) {
        log.info("예약생성요청 - 회원 ID:{}, 충전기 : {}",memberId, req.getChargerId());
        ReservationDto.Response response = reservationService.createReservation(memberId, req);
        log.info("예약성공 리액트로 데이터를 반환합니다.(PIN : {})",response.getReservationPin());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
