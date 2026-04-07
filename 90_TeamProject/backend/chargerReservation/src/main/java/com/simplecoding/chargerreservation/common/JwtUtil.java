package com.simplecoding.chargerreservation.common;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

// JWT 토큰 생성 / 검증 / 파싱 담당
@Component
public class JwtUtil {

    // application.properties 에서 시크릿 키 주입
    // application.properties 에서 시크릿 키 주입
    @Value("${jwt.secret-key}")
    private String secret;

    // 액세스 토큰 만료 시간 — 1시간
    private final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 60;

    // 시크릿 키 생성
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ── 토큰 생성 ──────────────────────────────

    // 액세스 토큰 생성
    // adminId, memberId, adminRole 을 토큰 안에 담음
    public String generateAccessToken(Long adminId, Long memberId, String adminRole) {
        return Jwts.builder()
                .subject(String.valueOf(adminId))
                .claim("memberId", memberId)
                .claim("adminRole", adminRole)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }

    // ── 토큰 파싱 ──────────────────────────────

    // 토큰에서 Claims(데이터) 꺼내기
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // 토큰에서 adminId 꺼내기
    public Long getAdminId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    // 토큰에서 adminRole 꺼내기
    public String getAdminRole(String token) {
        return getClaims(token).get("adminRole", String.class);
    }

    // ── 토큰 검증 ──────────────────────────────

    // 토큰이 유효한지 확인
    // 유효하면 true, 만료/변조 등이면 false
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}