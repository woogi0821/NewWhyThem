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
     * 1. [마커 전용 조회] DB에서 혼잡도와 거리를 미리 계산해서 가져옴 (Interface Projection 활용)
     * - 반환 타입이 MarkerProjection이므로 계산된 값이 유실되지 않음
     */
// StationRepository.java

    @Query(value = "SELECT " +
            "    s.STAT_ID AS statId, " +
            "    s.STAT_NM AS statNm, " +
            "    s.LAT AS lat, " +
            "    s.LNG AS lng, " +
            "    ROUND(6371 * acos(LEAST(1, GREATEST(-1, " +
            "        sin(TRUNC(:lat, 8) * (acos(-1)/180)) * sin(TRUNC(s.LAT, 8) * (acos(-1)/180)) + " +
            "        cos(TRUNC(:lat, 8) * (acos(-1)/180)) * cos(TRUNC(s.LAT, 8) * (acos(-1)/180)) * " +
            "        cos((TRUNC(s.LNG, 8) * (acos(-1)/180)) - (TRUNC(:lng, 8) * (acos(-1)/180))) " +
            "    ))), 2) AS distance, " +
            "    (SELECT COUNT(*) FROM CHARGER c WHERE c.STAT_ID = s.STAT_ID AND c.STAT = '2') AS availableCount, " +
            "    (SELECT COUNT(*) FROM CHARGER c WHERE c.STAT_ID = s.STAT_ID) AS totalCount, " +
            "    (SELECT COUNT(*) FROM CHARGER c WHERE c.STAT_ID = s.STAT_ID AND c.STAT IN ('1', '4', '5')) AS brokenCount " +
            "FROM STATION s " +
            "WHERE ROUND(6371 * acos(LEAST(1, GREATEST(-1, " +
            "        sin(TRUNC(:lat, 8) * (acos(-1)/180)) * sin(TRUNC(s.LAT, 8) * (acos(-1)/180)) + " +
            "        cos(TRUNC(:lat, 8) * (acos(-1)/180)) * cos(TRUNC(s.LAT, 8) * (acos(-1)/180)) * " +
            "        cos((TRUNC(s.LNG, 8) * (acos(-1)/180)) - (TRUNC(:lng, 8) * (acos(-1)/180))) " +
            "    ))), 2) <= :radius " +
            "ORDER BY distance ASC " +
            "FETCH NEXT 100 ROWS ONLY",
            nativeQuery = true)
    List<MarkerProjection> findMarkersWithinRadius(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radius") Double radius
    );
    /**
     * 2. [목록 전용 조회] 페이징 처리가 포함된 상세 정보 조회 (Entity 활용)
     */
    @Query(value = "SELECT * FROM ( " +
            "    SELECT s.*, " +
            "    ROUND(6371 * acos(LEAST(1, GREATEST(-1, " +
            "        cos(:lat * 0.0174532925) * cos(s.LAT * 0.0174532925) * " +
            "        cos((s.LNG * 0.0174532925) - (:lng * 0.0174532925)) + " +
            "        sin(:lat * 0.0174532925) * sin(s.LAT * 0.0174532925) " +
            "    ))), 2) AS distance " +
            "    FROM STATION s " +
            ") t WHERE t.distance <= :radius " +
            "ORDER BY t.distance ASC " +
            "OFFSET :offset ROWS FETCH NEXT :size ROWS ONLY",
            nativeQuery = true)
    List<StationEntity> findStationsWithinRadiusWithPaging(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radius") Double radius,
            @Param("offset") int offset,
            @Param("size") int size);

    /**
     * 3. 통합 키워드 검색
     */
    @Query("SELECT s FROM StationEntity s " +
            "WHERE s.statNm LIKE %:keyword% " +
            "OR s.addr LIKE %:keyword% " +
            "OR s.bnm LIKE %:keyword% " +
            "ORDER BY s.statNm ASC")
    List<StationEntity> findByIntegratedSearch(@Param("keyword") String keyword);

    // 나머지 메서드들 (동일)
    Optional<StationEntity> findByStatId(String statId);
    List<StationEntity> findByZcode(String zcode);
    List<StationEntity> findByBnmContaining(String bnm);
    Optional<StationEntity> findByLatAndLng(Double lat, Double lng);
}