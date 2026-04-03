package com.simplecoding.chargerreservation.member.entity;

import com.simplecoding.chargerreservation.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "MEMBER")
@SequenceGenerator(
    name = "SQ_MEMBER_JPA",
    sequenceName = "SEQ_MEMBER_ID",
    allocationSize = 1
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString(exclude = "loginPw")
@EqualsAndHashCode(of = "memberId", callSuper = false)
public class Member extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,
        generator = "SQ_MEMBER_JPA")
    private Long memberId;

    @Column(nullable = false, unique = true)
    private String loginId;
    // 소셜 로그인 시 비밀번호가 비어있을 수 있으므로 nullable을 true로 변경 (기본값)
    @Column(nullable = true)
    private	String loginPw;

    private	String name;
    private	String phone;

    @Builder.Default
    @Column(nullable = false)
    private	String status = "ACTIVE";       // ACTIVE(기본값), INACTIVE 등

    @Builder.Default
    @Column(nullable = false)
    private	String memberGrade = "USER";   // BASIC, ADMIN 등

    // 소셜 로그인을 구분하기 위한 필드 (LOCAL, KAKAO, GOOGLE 등)
    @Builder.Default
    @Column(nullable = false)
    private	String provider = "LOCAL";
    private	String providerId;

    @Builder.Default
    private	Integer penaltyCount = 0;
    private	LocalDateTime suspendedUntil;

    // 소셜 로그인 사용자 정보 업데이트 메서드(더티체킹용)
    public Member updateSocialInfo(String name, String phone) {
        this.name = name;
        if (phone != null) {
            this.phone = phone;
        }
        return this;
    }

}
