package com.simplecoding.chargerreservation.station.controller;

import com.simplecoding.chargerreservation.charger.dto.MarkerDto;
import com.simplecoding.chargerreservation.station.dto.StationDto;
import com.simplecoding.chargerreservation.station.service.StationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    /**
     * 1. 내 주변 충전소 마커 조회 (반경 3km)
     * GET /api/stations/markers?lat=35.1485&lng=129.0637
     */
    @GetMapping("/markers")
    public ResponseEntity<List<MarkerDto>> getStationMarkers(
            @RequestParam Double lat,
            @RequestParam Double lng) {

        log.info("📍 주변 충전소 조회 요청 - 위도: {}, 경도: {}", lat, lng);
        List<MarkerDto> markers = stationService.getStationMarkers(lat, lng);

        return ResponseEntity.ok(markers);
    }

    /**
     * 2. 충전소 상세 정보 조회
     * GET /api/stations/detail/ME174147
     */
    @GetMapping("/detail/{statId}")
    public ResponseEntity<StationDto> getStationDetail(@PathVariable String statId) {

        log.info("🔎 충전소 상세 조회 요청 - ID: {}", statId);
        StationDto detail = stationService.getStationDetail(statId);

        return ResponseEntity.ok(detail);
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

}