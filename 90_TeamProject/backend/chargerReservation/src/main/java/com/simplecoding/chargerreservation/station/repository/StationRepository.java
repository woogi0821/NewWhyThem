package com.simplecoding.chargerreservation.station.repository;

import com.simplecoding.chargerreservation.station.entity.StationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<StationEntity, String> {

    /**
     * 하버사인(Haversine) 공식을 이용한 반경 검색 (오라클 SQL 전용)
     */
    @Query(value = "SELECT * FROM ( " +
            "    SELECT s.*, " +
            "    (6371 * acos(LEAST(1, GREATEST(-1, " +
            "        cos(:lat * 0.0174532925) * cos(s.LAT * 0.0174532925) * " +
            "        cos((s.LNG * 0.0174532925) - (:lng * 0.0174532925)) + " +
            "        sin(:lat * 0.0174532925) * sin(s.LAT * 0.0174532925) " +
            "    )))) AS distance " +
            "    FROM STATION s " +
            ") WHERE distance <= :radius " +
            "ORDER BY distance", nativeQuery = true)
    List<StationEntity> findStationsWithinRadius(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radius") Double radius);

    // --- 스케줄러 및 데이터 관리를 위해 추가 추천하는 메서드 ---

    /**
     * 특정 충전소 ID로 데이터가 존재하는지 확인 (Optional 반환)
     * 스케줄러에서 '기존 데이터 수정' vs '신규 등록' 판단 시 사용합니다.
     */
    Optional<StationEntity> findByStatId(String statId);

    /**
     * 특정 지역 코드(zcode)에 해당하는 충전소 목록 조회
     * 나중에 지역별로 나누어 업데이트하거나 필터링할 때 유용합니다.
     */
    List<StationEntity> findByZcode(String zcode);

    /**
     * 운영기관명(bnm)으로 충전소 검색
     * 특정 브랜드(예: 환경부)의 요금 일괄 변경 등을 처리할 때 활용 가능합니다.
     */
    List<StationEntity> findByBnmContaining(String bnm);
}