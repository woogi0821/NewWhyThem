package com.simplecoding.chargerreservation.penalty.service;

import com.simplecoding.chargerreservation.penalty.dto.PenaltyRequestDto;
import com.simplecoding.chargerreservation.penalty.dto.PenaltyResponseDto;
import com.simplecoding.chargerreservation.penalty.entity.PenaltyHistory;
import com.simplecoding.chargerreservation.penalty.repository.PenaltyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;


    //      1. 패널티 등록 및 문자 발송 (단계별 처리)
    @Transactional
    public PenaltyResponseDto processPenaltyStep(PenaltyRequestDto requestDto, int step) {
        PenaltyHistory penalty = new PenaltyHistory();
        penalty.setMemberId(requestDto.getMemberId());
        penalty.setReservationId(requestDto.getReservationId());
        penalty.setCarNumber(requestDto.getCarNumber());
        penalty.setReason(requestDto.getReason());
        penalty.setNudgeCount(step);

        // DB 저장
        PenaltyHistory savedPenalty = penaltyRepository.save(penalty);

        // 메시지 발송 시뮬레이션
        sendStepSms(savedPenalty);

        return convertToResponseDto(savedPenalty);
    }


    //     2. [조회용] 특정 회원의 패널티 내역 전체 가져오기 (리액트 모달용)
    public List<PenaltyResponseDto> getMemberPenalties(String memberId) {
        return penaltyRepository.findByMemberId(memberId).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }


    //      3. [예약팀 협업용] 오늘 이 회원이 예약 가능한지 확인
    public boolean isRestrictedToday(String memberId) {
        // 오늘 00:00:00 ~ 23:59:59 범위 설정
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        // 오늘 날짜로 '3단계(최종)' 기록이 하나라도 있으면 true 반환
        return penaltyRepository.existsByMemberIdAndNudgeCountAndInsertTimeBetween(memberId, 3, start, end);
    }


//     [보조] 단계별 메시지 생성 및 전송

    private void sendStepSms(PenaltyHistory penalty) {
        String message = "";
        switch (penalty.getNudgeCount()) {
            case 1:
                message = "[충전 완료 안내] 충전이 완료되었습니다. 즉시 차량을 이동해 주세요. ※ 1시간 초과 점유 시 과태료가 부과될 수 있습니다.";
                break;
            case 2:
                message = "[출차 지연 경고] 10분이 경과되었습니다. 지속 미이동 시 금일 예약 서비스 이용이 제한될 수 있습니다.";
                break;
            case 3:
                message = "[이용 제한 안내] 장시간 미출차로 인해 금일 예약 서비스 이용이 자정까지 제한되었습니다.";
                break;
        }
        System.out.println(">>> [SMS 전송 To: " + penalty.getMemberId() + "] " + message);
        penalty.setNotiSentYn("Y");
    }


//     [보조] Entity를 ResponseDto로 변환 (Builder 사용)

    private PenaltyResponseDto convertToResponseDto(PenaltyHistory penalty) {
        return PenaltyResponseDto.builder()
                .penaltyId(penalty.getPenaltyId())
                .memberId(penalty.getMemberId())
                .carNumber(penalty.getCarNumber())
                .reason(penalty.getReason())
                .nudgeCount(penalty.getNudgeCount())
                .status(penalty.getStatus())
                .notiSentYn(penalty.getNotiSentYn())
                .insertTime(penalty.getInsertTime())
                .build();
    }
}