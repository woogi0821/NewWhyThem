package com.simplecoding.chargerreservation.station.controller;

import com.simplecoding.chargerreservation.charger.dto.MarkerDto;
import com.simplecoding.chargerreservation.station.dto.StationDto;
import com.simplecoding.chargerreservation.station.service.StationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://172.27.80.1:5501") // 모든 도메인에서의 접속을 허용 (테스트용)
@Slf4j
@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    /**
     * [지도 마커 조회] 주변 1.5km 내 최대 100개의 마커 정보를 반환합니다.
     * GET /api/stations/markers?lat=35.1798&lng=129.0750
     */
    @GetMapping("/markers")
    public ResponseEntity<List<MarkerDto>> getMarkers(
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng) {

        log.info("🌐 [API] 마커 조회 요청 - 위도: {}, 경도: {}", lat, lng);

        List<MarkerDto> markers = stationService.getStationMarkers(lat, lng);

        // 결과가 비어있어도 200 OK와 빈 리스트를 보내는 것이 클라이언트 통신에 더 안정적입니다.
        return ResponseEntity.ok(markers);
    }

    /**
     * [API] 충전소 통합 검색 (이름, 주소, 운영사 키워드)
     * GET /api/station/search?keyword=강남
     */
    @GetMapping("/search")
    public ResponseEntity<List<StationDto>> searchStations(@RequestParam(value = "keyword", required = false) String keyword) {
        log.info("▶ [API 호출] 충전소 검색 - 키워드: [{}]", keyword);

        // 서비스 호출
        List<StationDto> results = stationService.searchStations(keyword);

        log.info("◀ [API 응답] 검색 완료 - 결과: {}건", results.size());

        // 200 OK 상태코드와 함께 결과 반환
        return ResponseEntity.ok(results);
    }

    /**
     * 3. [추가] 충전소 상세 정보 조회 (거리 계산 + 실시간 충전기 상태 포함)
     * GET /api/stations/KP002210?userLat=35.1485&userLng=129.0637
     */
    @GetMapping("/{statId}")
    public ResponseEntity<StationDto> getStationDetail(
            @PathVariable String statId,
            // defaultValue를 설정하거나 required = false를 주면 위치 정보가 없어도 에러가 나지 않습니다.
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng) {

        log.info("🔍 [API] 충전소 상세 조회 요청 - ID: {}, 내 위치: ({}, {})",
                statId,
                userLat != null ? userLat : "알수없음",
                userLng != null ? userLng : "알수없음");

        try {
            // 서비스 호출 (우리가 테스트했던 그 로직!)
            StationDto detail = stationService.getStationDetail(statId, userLat, userLng);
            return ResponseEntity.ok(detail);
        } catch (RuntimeException e) {
            // 충전소를 찾지 못했을 경우 404 Not Found를 응답하는 것이 더 정확합니다.
            log.error("❌ 상세 조회 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * [추가] 1. 내 주변 충전소 리스트 조회 (무한 스크롤용 - 20개씩)
     * GET /api/stations/around?lat=35.1061&lng=128.9665&page=0
     */
    @GetMapping("/around")
    public ResponseEntity<List<StationDto>> getAroundStations(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "0") int page) {

        log.info("📱 [리스트 조회] 위도: {}, 경도: {}, 페이지: {}", lat, lng, page);

        // 우리가 테스트했던 그 서비스 메서드 호출! (반경 1.5km, 20개씩 페이징)
        List<StationDto> stations = stationService.getStationsWithDistancePaged(lat, lng, page);

        return ResponseEntity.ok(stations);
    }

}