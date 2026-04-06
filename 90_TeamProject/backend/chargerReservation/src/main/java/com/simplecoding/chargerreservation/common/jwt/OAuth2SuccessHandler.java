package com.simplecoding.chargerreservation.common.jwt;

import com.simplecoding.chargerreservation.member.entity.Member;
import com.simplecoding.chargerreservation.member.repository.MemberRepository;
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
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider tokenProvider;
    private final MemberRepository memberRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        // Principal에서 사용자 정보 추출
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = null;
        if (attributes.get("email") != null) {
            email = (String) attributes.get("email");
        } else if (attributes.get("kakao_account") != null) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            email = (String) kakaoAccount.get("email");
        } else if (attributes.get("response") != null) {
            Map<String, Object> navResponse = (Map<String, Object>) attributes.get("response");
            email = (String) navResponse.get("email");
        }
        log.info("OAuth2 로그인 성공(토큰발급): {}", email);

        // DB 조회 (이메일이 null일 경우를 대비해 예외처리 강화)
        if (email == null) {
            throw new RuntimeException("소셜 계정으로부터 이메일 정보를 불러올 수 없습니다.");
        }

        Member member = memberRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("등록되지 않은 사용자입니다."));

        // JwtTokenProvider를 사용하여 토큰 생성
        String accessToken = tokenProvider.createAccessToken(member);
        String refreshToken = tokenProvider.createRefreshToken(member.getLoginId());

        // 클라이언트(React)로 리다이렉트 할 URL 설정
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
            .queryParam("accessToken", accessToken)
            .queryParam("refreshToken", refreshToken)
            .build().toUriString();

        log.info("React로 리다이렉트: {}", targetUrl);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

}
