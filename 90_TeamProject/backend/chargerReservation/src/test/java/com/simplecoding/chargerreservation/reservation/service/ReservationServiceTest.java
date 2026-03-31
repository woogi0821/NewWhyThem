package com.simplecoding.chargerreservation.reservation.service;

import com.simplecoding.chargerreservation.reservation.dto.ReservationDto;
import com.simplecoding.chargerreservation.reservation.entity.Reservation;
import com.simplecoding.chargerreservation.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @InjectMocks
    private ReservationService reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    @Test
    @DisplayName("성공 : 급속 충전기 예약 시 종료시간이 1시간 뒤로 계산되어야함")
    void createReservation() {
        Long memberId = 1L;
        LocalDateTime startTime = LocalDateTime.now().plusDays(1);
        ReservationDto.Request req = ReservationDto.Request.builder()
                .chargerId("CH_001")
                .carNumber("12가1234")
                .chargerType("RAPID")
                .startTime(startTime)
                .build();
        given(reservationRepository.countByMemberIdAndStatusIn(anyLong(), any(List.class))).willReturn(0L);
        given(reservationRepository.existsOverlappingReservation(any(),any(),any())).willReturn(false);

        Reservation mockSavedEntity = Reservation.builder()
                .chargerId("CH_001")
                .startTime(startTime)
                .endTime(startTime.plusHours(1))
                .status("RESERVED")
                .build();
        given(reservationRepository.save(any(Reservation.class))).willReturn(mockSavedEntity);

        ReservationDto.Response response = reservationService.createReservation(memberId, req);

        assertNotNull(response);
        assertEquals(startTime.plusHours(1),response.getEndTime(), "급속 충전중이므로 종료시간은 1시간 뒤입니다.");
    }

    @Test
    @DisplayName("1개의 계정당 활성예약 리밋 테스트")
    void createReservation_Fail_MaxLimit(){
        Long memberId = 1L;
        ReservationDto.Request req = ReservationDto.Request.builder()
                .chargerType("RAPID")
                .startTime(LocalDateTime.now().plusDays(1))
                .build();

        given(reservationRepository.countByMemberIdAndStatusIn(anyLong(), any(List.class))).willReturn(2L);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, ()->{
            reservationService.createReservation(memberId, req);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
//        assertTrue(exception.getReason().contains("이미 예약건수가 최대치임"));
    }

    @Test
    @DisplayName("예약하려는 시간에 다른 예약이 있으면 예외처리")
    void createReservation_Fail_TimeOverlap() {
        Long memberId = 1L;
        ReservationDto.Request req = ReservationDto.Request.builder()
                .chargerId("CH_001")
                .chargerType("SLOW")
                .startTime(LocalDateTime.now().plusDays(1))
                .build();

        given(reservationRepository.countByMemberIdAndStatusIn(anyLong(),any(List.class))).willReturn(0L);
        given(reservationRepository.existsOverlappingReservation(any(), any(), any())).willReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, ()->{
            reservationService.createReservation(memberId, req);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("이미 다른 예약이 존재합니다."));
    }
}