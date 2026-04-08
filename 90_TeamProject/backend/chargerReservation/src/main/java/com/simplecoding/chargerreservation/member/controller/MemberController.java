package com.simplecoding.chargerreservation.member.controller;

import com.simplecoding.chargerreservation.common.CommonUtil;
import com.simplecoding.chargerreservation.common.jwt.JwtTokenProvider;
import com.simplecoding.chargerreservation.member.dto.MemberDto;
import com.simplecoding.chargerreservation.member.dto.TokenDto;
import com.simplecoding.chargerreservation.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/member")
public class MemberController {

    private final MemberService memberService;
    private final CommonUtil commonUtil;

    // 회원가입
    @PostMapping("/join")
    public ResponseEntity<String> join(@Valid @RequestBody MemberDto memberDto,
                                       BindingResult result) {
        commonUtil.checkBindingResult(result);
        memberService.join(memberDto);

        return ResponseEntity.ok().build();
    }





    // 로그인 (성공 시 AT, RT 발급)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MemberDto memberDto) {
        try{
            // 실제 운영 시에는 HttpServletRequest에서 IP와 기기 정보를 추출하지만, 우선 임시값으로 테스트합니다.
            TokenDto tokenDto = memberService.login(memberDto.getLoginId(), memberDto.getLoginPw(), "Web-Browser", "127.0.0.1");
            log.info("로그인 성공: {}", memberDto.getLoginId());
            return ResponseEntity.ok(tokenDto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // 토큰 재발급 (AccessToken 만료 시 리액트에서 호출)
    @PostMapping("/refresh")
    public ResponseEntity<TokenDto> refresh(@RequestBody String refreshToken) {
        // 클라이언트가 보낸 RT로 새 AT를 발급
        TokenDto newAccessToken = memberService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(newAccessToken);
    }

    // 로그아웃 (DB에서 RT 삭제)
    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication authentication) {
        // 토큰이 유효하다면 SecurityContextHolder에서 인증 정보 자동 주입
        if (authentication == null) {
            return ResponseEntity.status(401).body("인증 정보가 없습니다.");
        }

        String loginId = authentication.getName();      // 현재 로그인한 유저의 정보를 가져옴
        memberService.logout(loginId);

        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

}
