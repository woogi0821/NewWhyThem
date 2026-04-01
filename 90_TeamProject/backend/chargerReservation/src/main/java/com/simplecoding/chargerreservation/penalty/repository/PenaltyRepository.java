package com.simplecoding.chargerreservation.penalty.repository;

import com.simplecoding.chargerreservation.penalty.entity.PenaltyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PenaltyRepository extends JpaRepository<PenaltyHistory, Long> {
    // 1. 특정 회원의 전체 패널티 내역 조회 (마이페이지용)
    List<PenaltyHistory> findByMemberId(String memberId);

    // 2. 아직 문자를 안 보낸(N) 내역만 조회 (지환님 알림 기능용)
    List<PenaltyHistory> findByNotiSentYn(String notiSentYn);
}
