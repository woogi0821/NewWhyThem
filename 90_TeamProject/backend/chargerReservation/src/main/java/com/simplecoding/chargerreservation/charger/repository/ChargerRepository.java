package com.simplecoding.chargerreservation.charger.repository;

import com.simplecoding.chargerreservation.charger.entity.ChargerEntity;
import com.simplecoding.chargerreservation.charger.entity.ChargerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargerRepository extends JpaRepository<ChargerEntity, ChargerId> {

    // 1. 유지: 특정 충전소를 클릭했을 때 상세 충전기 목록을 보여주는 용도
    List<ChargerEntity> findByStatId(String statId);

    // 2. 삭제: 반경 검색은 이제 StationRepository에서 담당하므로 여기서 지웁니다.
    // (1,001개 데이터 중복의 원인이었던 @Query 부분 삭제)
}