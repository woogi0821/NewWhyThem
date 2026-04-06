package com.simplecoding.chargerreservation.member.repository;

import com.simplecoding.chargerreservation.member.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {
    // findById(String email)를 통해 인증 정보를 조회
    Optional<EmailVerification> findByEmailAndIsVerified(String email, String isVerified);
}
