package com.simplecoding.chargerreservation.reservation.entity;

import com.simplecoding.chargerreservation.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "RESERVATION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reserv_seq")
    @SequenceGenerator(name = "reserv_seq",sequenceName = "SEQ_RESERVATION_ID",allocationSize = 1)
    @Column(name = "RESERVATION_ID")
    private Long id;

    @Column(name = "MEMBER_ID",nullable = false)
    private Long memberId;

    @Column(name = "CHARGER_ID", nullable = false, length = 50)
    private String chargerId;

    @Column(name = "CAR_NUMBER", nullable = false, length = 20)
    private String carNumber;

    @Column(name = "RESERVATION_PIN",nullable = false)
    private String reservationPin;

    @Column(name = "START_TIME", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "END_TIME", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;

    @Version
    @Column(name = "VERSION")
    private Long version;

    @Builder
    public Reservation(Long memberId, String chargerId, String carNumber, String reservationPin, LocalDateTime startTime, LocalDateTime endTime, String status){
        this.memberId = memberId;
        this.chargerId = chargerId;
        this.carNumber = carNumber;
        this.reservationPin = reservationPin;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }
}
