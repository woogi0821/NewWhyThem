package com.simplecoding.chargerreservation.common;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// 모든 요청마다 한 번씩 실행되는 JWT 필터
// OncePerRequestFilter : 요청당 딱 한 번만 실행 보장
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. 요청 헤더에서 Authorization 값 꺼냄
        String authHeader = request.getHeader("Authorization");

        // 2. 헤더가 없거나 "Bearer " 로 시작하지 않으면 그냥 통과
        // 로그인 API 같은 인증 불필요 요청은 여기서 통과됨
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. "Bearer " 제거하고 순수 토큰만 추출
        String token = authHeader.substring(7);

        // 4. 토큰 유효성 검증
        if (!jwtUtil.validateToken(token)) {
            // 유효하지 않은 토큰 — 401 반환
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 5. 토큰에서 adminRole 꺼내서 권한 설정
        String adminRole = jwtUtil.getAdminRole(token);
        Long adminId = jwtUtil.getAdminId(token);

        // 6. Spring Security 에 인증 정보 등록
        // ROLE_ 접두사 붙여야 Spring Security 가 권한으로 인식
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        adminId,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + adminRole))
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 7. 다음 필터로 넘어감
        filterChain.doFilter(request, response);
    }
}