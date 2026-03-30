package com.simplecoding.chargerreservation.charger.service;

import com.simplecoding.chargerreservation.charger.repository.ChargerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChargerService {

    private final JdbcTemplate jdbcTemplate;
    private final ChargerRepository chargerRepository;


//    여기에 데이터 저장 코드 있음

    //    region
    /**
     * 공공 API 수집부터 DB MERGE까지 한 번에 처리
     * (STATION 테이블에 존재하는 STAT_ID만 필터링하여 저장)
     */


    @Transactional
    public void collectAllChargerData() {
        String serviceKey = "6ebd5febab70800594860d7682eab328c14df15b1e1dfac30a7a011942ee6c3f";
        String url = "http://apis.data.go.kr/B552584/EvCharger/getChargerInfo";

        RestTemplate restTemplate = new RestTemplate();
        Set<String> uniqueKeys = new HashSet<>();
        List<JSONObject> buffer = new ArrayList<>();

        // 1. STATION 테이블에서 유효한 STAT_ID 58,000개를 먼저 가져옴 (FK 위반 방지)
        log.info("▶▶▶ [STATION] 유효 ID 조회 중...");
        List<String> validIds = jdbcTemplate.queryForList("SELECT STAT_ID FROM STATION", String.class);
        Set<String> validStatIdSet = new HashSet<>(validIds);
        log.info("▶▶▶ [STATION] 총 {}개의 부모 키 로드 완료", validStatIdSet.size());

        int pageNo = 1;
        int numOfRows = 5000;
        boolean hasMore = true;

        log.info("▶▶▶ [CHARGER] 데이터 수집 및 필터링 저장 시작");

        while (hasMore) {
            try {
                URI uri = UriComponentsBuilder.fromHttpUrl(url)
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("pageNo", pageNo)
                        .queryParam("numOfRows", numOfRows)
                        .queryParam("dataType", "JSON")
                        .build(true)
                        .toUri();

                String response = restTemplate.getForObject(uri, String.class);
                if (response == null || !response.startsWith("{")) break;

                JSONObject json = new JSONObject(response);
                JSONObject itemsObj = json.optJSONObject("items");
                if (itemsObj == null) break;

                JSONArray items = itemsObj.optJSONArray("item");
                if (items == null || items.length() == 0) break;

                for (int i = 0; i < items.length(); i++) {
                    JSONObject item = items.getJSONObject(i);
                    String sid = item.optString("statId", "").trim().toUpperCase();
                    String cid = item.optString("chgerId", "").trim().toUpperCase();

                    // 핵심 조건: 부모 테이블(STATION)에 존재하는 ID인 경우만 수집
                    if (!sid.isEmpty() && !cid.isEmpty() && validStatIdSet.contains(sid)) {
                        String compositeKey = sid + "_" + cid;
                        if (!uniqueKeys.contains(compositeKey)) {
                            uniqueKeys.add(compositeKey);
                            buffer.add(item);
                        }
                    }
                }

                log.info("✔ {}페이지 수집 중... (필터링된 누적 데이터: {})", pageNo, uniqueKeys.size());

                // 5,000건 단위로 DB Batch 실행
                if (buffer.size() >= 5000) {
                    saveToDb(buffer);
                    buffer.clear();
                }

                if (items.length() < numOfRows) hasMore = false;
                else pageNo++;

            } catch (Exception e) {
                log.error("!!! 수집 중 에러 발생: {}", e.getMessage());
                break;
            }
        }

        if (!buffer.isEmpty()) {
            saveToDb(buffer);
        }

        log.info("▶▶▶ [CHARGER] 작업 완료! 최종 저장된 충전기: {}건", uniqueKeys.size());
    }

    /**
     * DB 저장 로직 (제공해주신 테이블 명세 100% 반영)
     */
    private void saveToDb(List<JSONObject> list) {
        String sql = "MERGE INTO CHARGER c USING DUAL ON (c.STAT_ID = ? AND c.CHARGER_ID = ?) " +
                "WHEN MATCHED THEN UPDATE SET " +
                "c.CHARGER_TYPE = ?, c.STAT = ?, c.STAT_UPD_DT = ?, c.OUTPUT = ?, c.METHOD = ?, c.UPDATED_AT = SYSDATE " +
                "WHEN NOT MATCHED THEN INSERT " +
                "(STAT_ID, CHARGER_ID, CHARGER_TYPE, STAT, STAT_UPD_DT, OUTPUT, METHOD) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                JSONObject item = list.get(i);
                String sid = item.optString("statId").trim().toUpperCase();
                String cid = item.optString("chgerId").trim().toUpperCase();

                // ON 조건 (2개)
                ps.setString(1, sid);
                ps.setString(2, cid);

                // UPDATE 필드 (5개)
                ps.setString(3, item.optString("chgerType"));
                ps.setString(4, item.optString("stat", "9"));
                ps.setString(5, item.optString("statUpdDt"));
                ps.setInt(6, item.optInt("output", 0));
                ps.setString(7, item.optString("method"));

                // INSERT 필드 (7개)
                ps.setString(8, sid);
                ps.setString(9, cid);
                ps.setString(10, item.optString("chgerType"));
                ps.setString(11, item.optString("stat", "9"));
                ps.setString(12, item.optString("statUpdDt"));
                ps.setInt(13, item.optInt("output", 0));
                ps.setString(14, item.optString("method"));
            }

            @Override
            public int getBatchSize() {
                return list.size();
            }
        });
    }
    //endregion
}