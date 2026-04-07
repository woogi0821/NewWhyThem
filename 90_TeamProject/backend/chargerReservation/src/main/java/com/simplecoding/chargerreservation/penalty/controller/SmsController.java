package com.simplecoding.chargerreservation.penalty.controller; // 지환님의 서비스 경로
import com.simplecoding.chargerreservation.penalty.service.SmsService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/sms")
@CrossOrigin(origins = "http://localhost:5173") // 리액트 접속 허용
public class SmsController {

    private final SmsService smsService;

    // 생성자 주입 (SmsService를 가져옵니다)
    public SmsController(SmsService smsService) {
        this.smsService = smsService;
    }

    @PostMapping("/send-penalty")
    public Map<String, Object> sendPenalty(@RequestBody Map<String, String> data) {
        // 리액트에서 보낸 데이터 꺼내기
        String receiver = data.get("receiver");
        String userName = data.get("userName");
        String reason = data.get("reason");
        String restrictUntil = data.get("restrictUntil");

        // 서비스 실행! (진짜 문자 발송)
        smsService.sendPenaltyMessage(receiver, userName, reason, restrictUntil);

        // 리액트에게 결과 보고
        return Map.of(
                "success", true,
                "message", "성공적으로 발송되었습니다."
        );
    }
}