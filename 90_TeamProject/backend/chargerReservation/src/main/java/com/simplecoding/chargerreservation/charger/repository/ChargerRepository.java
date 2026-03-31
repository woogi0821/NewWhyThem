package com.simplecoding.chargerreservation.charger.repository;

import com.simplecoding.chargerreservation.charger.entity.ChargerEntity;
import com.simplecoding.chargerreservation.charger.entity.ChargerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChargerRepository extends JpaRepository<ChargerEntity, ChargerId> {

    // 1. 특정 충전소의 모든 충전기 목록 조회
    List<ChargerEntity> findByStatId(String statId);

    /**
     * 2. 스케줄러 전용: 상태 및 실시간 충전 이력 업데이트
     * 새로 추가된 3개의 필드(lastTsdt, lastTedt, nowTsdt)를 쿼리에 추가했습니다.
     */
    @Modifying
    @Transactional
    @Query("UPDATE ChargerEntity c SET " +
            "c.stat = :stat, " +
            "c.statUpdDt = :statUpdDt, " +
            "c.lastTsdt = :lastTsdt, " +
            "c.lastTedt = :lastTedt, " +
            "c.nowTsdt = :nowTsdt, " +
            "c.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE c.statId = :statId AND c.chargerId = :chargerId")
    int updateChargerStatus(
            @Param("statId") String statId,
            @Param("chargerId") String chargerId,
            @Param("stat") String stat,
            @Param("statUpdDt") String statUpdDt,
            @Param("lastTsdt") String lastTsdt,
            @Param("lastTedt") String lastTedt,
            @Param("nowTsdt") String nowTsdt
    );
}