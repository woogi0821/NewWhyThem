package com.simplecoding.chargerreservation.common.jwt;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
     private final JwtTokenProvider tokenProvider;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        // 1. 로그인에 성공한 유저 정보를 가져옵니다.
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        log.info("OAuth2 로그인 성공: {}", email);

        // 2. JWT 토큰 생성 (프로젝트에 구현된 토큰 생성 로직을 호출하세요)
        // String accessToken = tokenProvider.createAccessToken(email);
        // String refreshToken = tokenProvider.createRefreshToken(email);

        // 3. 클라이언트(React)로 리다이렉트 할 URL 설정
        // 보통 토큰을 쿼리 파라미터로 보내거나, 쿠키에 담아서 보냅니다.
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
            .queryParam("token", "발급된_액세스_토큰") // 실제로는 생성한 토큰 변수를 넣으세요.
            .build().toUriString();

        // 4. 리다이렉트 수행
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
