package com.simplecoding.chargerreservation.penalty.service;

import com.simplecoding.chargerreservation.penalty.dto.PenaltyRequestDto;
import com.simplecoding.chargerreservation.penalty.dto.PenaltyResponseDto;
import com.simplecoding.chargerreservation.penalty.entity.PenaltyHistory;
import com.simplecoding.chargerreservation.penalty.repository.PenaltyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PenaltyService {
    private final PenaltyRepository penaltyRepository;

    //    1. 패널티 등록 및 문자 발송 로직
    @Transactional // 데이터 저장 중 에러나면 자동 취소(롤백)해주는 안전장치
    public PenaltyResponseDto createPenalty(PenaltyRequestDto requestDto) {
        // [STEP 1] DTO 정보를 바탕으로 Entity(실제 데이터) 생성
        PenaltyHistory penalty = new PenaltyHistory();
        penalty.setMemberId(requestDto.getMemberId());
        penalty.setReservationId(requestDto.getReservationId());
        penalty.setCarNumber(requestDto.getCarNumber());
        penalty.setReason(requestDto.getReason());

        // 기본 벌점 10점 부여, 독촉 횟수 시작
        penalty.setPenaltyPoints(10);
        penalty.setNudgeCount(1);
        // [STEP 2] DB에 먼저 저장 (그래야 PK인 ID가 생겨요)
        PenaltyHistory savedPenalty = penaltyRepository.save(penalty);

        // [STEP 3] 문자 발송 (지환님이 나중에 Aligo API 연결할 부분!)
        boolean isSmsSuccess = sendSmsNotification(savedPenalty);

        // [STEP 4] 문자 발송 성공 시 상태 업데이트
        if (isSmsSuccess) {
            savedPenalty.setNotiSentYn("Y");
        }

        // [STEP 5] 저장된 결과를 ResponseDto(보고서)로 변환해서 리턴
        return convertToResponseDto(savedPenalty);
    }

    //    2. 특정 회원의 패널티 내역 전체 조회
    public List<PenaltyResponseDto> getMemberPenalties(String memberId) {
        return penaltyRepository.findByMemberId(memberId).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    // [보조] 실제 문자 발송 시뮬레이션 (나중에 Aligo 로직 삽입)
    private boolean sendSmsNotification(PenaltyHistory penalty) {
        // 실무 팁: 여기에서 Aligo API를 호출합니다.
        System.out.println("메시지 전송: " + penalty.getMemberId() + "님, 충전 구역 미출차로 벌점이 부과되었습니다.");
        return true; // 일단 성공했다고 가정
    }
//    [보조] Entity를 ResponseDto로 바꿔주는 편리한 도구
private PenaltyResponseDto convertToResponseDto(PenaltyHistory penalty) {
    return PenaltyResponseDto.builder()
            .penaltyId(penalty.getPenaltyId())
            .memberId(penalty.getMemberId())
            .carNumber(penalty.getCarNumber())
            .reason(penalty.getReason())
            .penaltyPoints(penalty.getPenaltyPoints())
            .nudgeCount(penalty.getNudgeCount())
            .status(penalty.getStatus())
            .notiSentYn(penalty.getNotiSentYn())
            .insertTime(penalty.getInsertTime())
            .build();
}
}
