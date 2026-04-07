package com.simplecoding.chargerreservation.admin.service;

import com.simplecoding.chargerreservation.admin.dto.AdminDto;
import com.simplecoding.chargerreservation.admin.dto.AdminLoginRequestDto;
import com.simplecoding.chargerreservation.admin.dto.AdminLoginResponseDto;
import com.simplecoding.chargerreservation.admin.dto.AdminMemberDto;
import com.simplecoding.chargerreservation.admin.entity.Admin;
import com.simplecoding.chargerreservation.admin.repository.AdminRepository;
import com.simplecoding.chargerreservation.common.JwtUtil;
import com.simplecoding.chargerreservation.member.entity.Member;
import com.simplecoding.chargerreservation.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final AdminRepository adminRepository;
    private final MemberRepository memberRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // ── 관리자 로그인 ────────────────────────────
    // 1. loginId 로 MEMBER 테이블에서 회원 조회
    // 2. BCrypt 비밀번호 비교
    // 3. STATUS 가 ACTIVE 인지 확인
    // 4. 정지 기간 확인
    // 5. ADMIN 테이블에서 해당 MEMBER_ID 확인
    // 6. JWT 토큰 발급 후 반환
    public AdminLoginResponseDto login(AdminLoginRequestDto dto) {

        Member member = memberRepository.findByLoginId(dto.getLoginId())
                .orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(dto.getLoginPw(), member.getLoginPw())) {
            throw new RuntimeException("아이디 또는 비밀번호가 올바르지 않습니다");
        }

        if (!member.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("이용할 수 없는 계정입니다");
        }

        if (member.getSuspendedUntil() != null
                && member.getSuspendedUntil().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("이용 정지된 계정입니다");
        }

        Admin admin = adminRepository.findByMemberId(member.getMemberId())
                .orElseThrow(() -> new RuntimeException("관리자 권한이 없습니다"));

        String accessToken = jwtUtil.generateAccessToken(
                admin.getAdminId(),
                member.getMemberId(),
                admin.getAdminRole()
        );

        return new AdminLoginResponseDto(
                accessToken,
                admin.getAdminRole(),
                admin.getAdminId()
        );
    }

    // ── 관리자 전체 목록 조회 ────────────────────
    @Transactional(readOnly = true)
    public List<AdminDto> getAdminList() {

        List<Admin> admins = adminRepository.findAll();

        return admins.stream()
                .map(admin -> {
                    String name = memberRepository.findById(admin.getMemberId())
                            .map(Member::getName)
                            .orElse("알 수 없음");
                    return AdminDto.from(admin, name);
                })
                .collect(Collectors.toList());
    }

    // ── 관리자 해제 (SUPER 만 가능) ──────────────
    public void deleteAdmin(Long requesterId, Long targetId) {

        Admin requester = adminRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("요청자를 찾을 수 없습니다"));

        if (!requester.getAdminRole().equals("SUPER")) {
            throw new RuntimeException("권한이 없습니다");
        }

        if (requesterId.equals(targetId)) {
            throw new RuntimeException("자기 자신을 해제할 수 없습니다");
        }

        Admin target = adminRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("대상 관리자를 찾을 수 없습니다"));

        adminRepository.delete(target);
    }

    // ── 관리자 등록 ──────────────────────────────
    public AdminDto createAdmin(AdminDto dto) {
        Admin admin = new Admin(dto.getMemberId(), dto.getAdminRole());
        return AdminDto.from(adminRepository.save(admin));
    }

    // ── 관리자 단건 조회 ─────────────────────────
    @Transactional(readOnly = true)
    public AdminDto getAdmin(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("admin not found"));
        return AdminDto.from(admin);
    }

    // ── 관리자 역할 변경 (SUPER 만 가능) ──────────
    public AdminDto updateAdminRole(Long requesterId, Long targetId, String newRole) {

        Admin requester = adminRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("요청자를 찾을 수 없습니다"));

        if (!requester.getAdminRole().equals("SUPER")) {
            throw new RuntimeException("권한이 없습니다");
        }

        Admin target = adminRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("대상 관리자를 찾을 수 없습니다"));

        target.updateRole(newRole);
        return AdminDto.from(adminRepository.save(target));
    }

    // ── 회원 전체 목록 조회 ──────────────────────
    // MEMBER 테이블 전체 조회
    // AdminMemberDto 로 변환해서 반환
    @Transactional(readOnly = true)
    public List<AdminMemberDto> getMemberList() {

        // MEMBER 테이블 전체 조회
        return memberRepository.findAll()
                .stream()
                .map(AdminMemberDto::from)
                .collect(Collectors.toList());
    }

    // ── 회원 상태 변경 ───────────────────────────
    // STATUS 변경 — ACTIVE / SUSPENDED / WITHDRAWN
    // 정지 처리 시 SUSPENDED_UNTIL 24시간 설정
    // 정지 해제 시 SUSPENDED_UNTIL null 로 초기화
    public AdminMemberDto updateMemberStatus(Long memberId, String newStatus) {

        // 회원 조회 — 없으면 예외 발생
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다"));

        // 상태 변경
        member.setStatus(newStatus);

        // 정지 처리 시 24시간 정지 기간 설정
        if (newStatus.equals("SUSPENDED")) {
            member.setSuspendedUntil(LocalDateTime.now().plusHours(24));
        }

        // 정지 해제 / 탈퇴 시 정지 기간 초기화
        if (newStatus.equals("ACTIVE") || newStatus.equals("WITHDRAWN")) {
            member.setSuspendedUntil(null);
        }

        // 변경된 회원 정보 저장 후 반환
        return AdminMemberDto.from(memberRepository.save(member));
    }
}