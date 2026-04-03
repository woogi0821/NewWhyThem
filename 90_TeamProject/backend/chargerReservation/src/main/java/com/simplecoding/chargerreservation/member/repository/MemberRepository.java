package com.simplecoding.chargerreservation.member.repository;

import com.simplecoding.chargerreservation.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    // 1. 로그인 시 아이디로 회원 정보를 찾기 위해 필요
    Optional<Member> findByLoginId(String loginId);
    // 소셜 로그인 중복 확인 및 기존 회원 찾기
    Optional<Member> findByProviderAndProviderId(String provider, String providerId);

    // 2. 회원가입 시 아이디 중복 체크를 위해 필요
    boolean existsByLoginId(String loginId);
}
