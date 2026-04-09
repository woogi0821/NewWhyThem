package com.simplecoding.chargerreservation.member.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberTokenDto {
    private String grantType;
    private String accessToken;
    private String refreshToken;
    private Long memberId;
    private String memberGrade;
}
