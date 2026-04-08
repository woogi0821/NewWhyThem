package com.simplecoding.chargerreservation.reservation.repository;

import com.simplecoding.chargerreservation.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    //한개의 계정당 최대 2개의 예약 제한용(매크로 및 독점 방지)
    //memberId의 예약 상태를 확인해서 예약 또는 충전중인 상태의 갯수를 파악함
    Long countByMemberIdAndStatusIn(Long memberId, List<String> statuses);

    //시간 겹침 차단
    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
        FROM Reservation r
        WHERE r.chargerId = :chargerId
        AND r.status IN ('RESERVED', 'CHARGING')
        AND r.startTime < :endTime
        AND r.endTime > :startTime
""")
    boolean existsOverlappingReservation(
            @Param("chargerId") String chargerId,
            @Param("startTime")LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
            );

    Optional<Reservation> findByChargerIdAndStatusAndReservationPin(String chargerId, String status, String reservationPin);

    // 예약 시간이 1분 지났고, 아직 알림을 안 보낸 '예약중' 상태인 사람 조회
    @Query("""
        SELECT r FROM Reservation r 
        WHERE r.startTime <= :targetTime 
        AND r.status = 'RESERVED' 
        AND r.isAlertSent = 'N'
    """)
    List<Reservation> findNoShowAlertTargets(@Param("targetTime") LocalDateTime targetTime);

    // 예약 시간이 10분 지났고, 아직 충전을 시작 안 한(여전히 RESERVED) 사람 조회
    @Query("""
        SELECT r FROM Reservation r 
        WHERE r.startTime <= :targetTime 
        AND r.status = 'RESERVED'
    """)
    List<Reservation> findNoShowCancelTargets(@Param("targetTime") LocalDateTime targetTime);

}
