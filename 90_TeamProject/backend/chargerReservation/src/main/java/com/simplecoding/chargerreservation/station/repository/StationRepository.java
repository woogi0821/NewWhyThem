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
     * 1. 하버사인(Haversine) 공식을 이용한 반경 검색 (수정됨)
     * - Native Query 특성상 Entity로 바로 매핑되지 않는 'distance' 컬럼을 포함하기 위해
     * - 인터페이스 기반 프로젝션이나 별도 처리가 필요할 수 있지만,
     * - 일단 기본 Entity 구조를 유지하며 거리순 정렬과 필터링을 완벽히 수행합니다.
     * - 페이징처리해서 한번에 찍히는 마커 줄이기
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
            "ORDER BY t.distance ASC " + // 가까운 순 정렬
            "OFFSET :offset ROWS FETCH NEXT :size ROWS ONLY", // 페이징 핵심
            nativeQuery = true)
    List<StationEntity> findStationsWithinRadiusWithPaging(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radius") Double radius,
            @Param("offset") int offset,
            @Param("size") int size);

    /**
     * 2. 통합 키워드 검색 (충전소명 OR 주소 OR 운영기관명)
     */
    @Query("SELECT s FROM StationEntity s " +
            "WHERE s.statNm LIKE %:keyword% " +
            "OR s.addr LIKE %:keyword% " +
            "OR s.bnm LIKE %:keyword% " +
            "ORDER BY s.statNm ASC")
    List<StationEntity> findByIntegratedSearch(@Param("keyword") String keyword);

    /**
     * 3. 특정 충전소 ID로 데이터 조회
     */
    Optional<StationEntity> findByStatId(String statId);

    /**
     * 4. 특정 지역 코드(zcode)로 조회
     */
    List<StationEntity> findByZcode(String zcode);

    /**
     * 5. 운영기관명(bnm) 단독 검색
     */
    List<StationEntity> findByBnmContaining(String bnm);

    /**
     * 6. 좌표 기반 중복 체크를 위한 메서드 (추가 권장)
     */
    Optional<StationEntity> findByLatAndLng(Double lat, Double lng);
}