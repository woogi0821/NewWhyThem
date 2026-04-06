package com.simplecoding.chargerreservation.station.repository;

public interface MarkerProjection {
    String getStatId();
    String getStatNm();      // [추가] 충전소 이름
    Double getLat();
    Double getLng();
    Double getDistance();
    Integer getTotalCount();
    Integer getAvailableCount();
    Integer getBrokenCount();   // [추가] 고장 대수
}