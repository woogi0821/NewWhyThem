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
     * 1. 하버사인(Haversine) 공식을 이용한 반경 검색 (기존 유지)
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

    /**
     * 2. 통합 키워드 검색 (충전소명 OR 주소 OR 운영기관명)
     * 사용자가 검색창에 입력한 단어로 세 가지 컬럼을 동시에 뒤집니다.
     */
    @Query("SELECT s FROM StationEntity s " +
            "WHERE s.statNm LIKE %:keyword% " +
            "OR s.addr LIKE %:keyword% " +
            "OR s.bnm LIKE %:keyword% " +
            "ORDER BY s.statNm ASC")
    List<StationEntity> findByIntegratedSearch(@Param("keyword") String keyword);

    /**
     * 3. 특정 충전소 ID로 데이터 조회 (기존 유지)
     */
    Optional<StationEntity> findByStatId(String statId);

    /**
     * 4. 특정 지역 코드(zcode)로 조회 (기존 유지)
     */
    List<StationEntity> findByZcode(String zcode);

    /**
     * 5. 운영기관명(bnm) 단독 검색 (기존 유지)
     */
    List<StationEntity> findByBnmContaining(String bnm);
}