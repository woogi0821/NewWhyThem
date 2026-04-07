package com.simplecoding.chargerreservation.admin.entity;

import com.simplecoding.chargerreservation.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ADMIN")
@Getter
@NoArgsConstructor
public class Admin extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "ADMIN_ID")
    private Long adminId;

    @Column(name = "MEMBER_ID", nullable = false)
    private long memberId;

    // nullable = false — 관리자 권한은 필수값
    @Column(name = "ADMIN_ROLE", length = 20, nullable = false)
    private String adminRole;

    public Admin(Long memberId, String adminRole) {
        this.memberId = memberId;
        this.adminRole = adminRole;
    }

    // 역할 변경 메서드
    public void updateRole(String newRole) {
        this.adminRole = newRole;
    }
}