// src/components/common/Home.tsx
import Modal from "./Modal";
import Button from "./Button";
import { useModal } from "../../hook/useModal";
import { sendPenaltySms } from "../../services/smsService"; // 🎯 추가

export default function Home() {
  const { isOpen, open, close } = useModal();

  const userData = {
    name: "홍길동",
    phone: "01034441086", // 실제 테스트 시 본인 번호(나중에 DB에서 가져오는 형태로 변경)
    penaltyReason: "어제 노쇼(No-Show)",
    restrictUntil: "오늘 23:59"
  };

  // 🎯 문자 발송 함수
  const handleConfirm = async () => {
    const result = await sendPenaltySms({
      receiver: userData.phone,
      userName: userData.name,
      reason: userData.penaltyReason,
      restrictUntil: userData.restrictUntil
    });

    if (result.success) {
      alert("패널티 안내 문자가 발송되었습니다.");
    } else {
      alert("발송 실패: " + result.message);
    }
    close();
  };

  return (
    <div className="p-10 flex flex-col items-center gap-5">
      <h1 className="text-2xl font-black text-[#0F172A]">패널티 시스템 테스트</h1>
      
      <Button size="lg" variant="danger" onClick={open}>
        이용 제한 안내 발송 테스트
      </Button>
      
      <Modal isOpen={isOpen} onClose={close} title="이용 제한 알림">
        <div className="flex flex-col gap-6 text-center">
          <p className="text-[#1E293B]">
            <span className="font-bold">{userData.name}</span>님에게 <br/>
            패널티 안내 문자를 발송하시겠습니까?
          </p>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={close}>취소</Button>
            {/* 🎯 확인 버튼 클릭 시 문자 발송 실행 */}
            <Button variant="primary" className="flex-1" onClick={handleConfirm}>발송</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
