// src/components/common/Home.tsx
import { useState } from "react";
import Modal from "./Modal";
import Button from "../../common/Button"; // 방금 만든 버튼 임포트!

export function Home() {
  const [show, setShow] = useState(false);

  return (
    <div className="p-10 flex flex-col items-center gap-5">
      <h1 className="text-2xl font-black text-[#0F172A]">전기차 충전 시스템 테스트</h1>
      
      {/* 1. 메인 버튼: 팀 가이드대로 size="lg" 적용 */}
      <Button size="lg" onClick={() => setShow(true)}>
        예약하기 테스트
      </Button>
      
      {/* 2. 모달 연결 */}
      <Modal 
        isOpen={show} 
        onClose={() => setShow(false)} 
        title="충전 예약 확정"
      >
        <div className="flex flex-col gap-5">
          <p className="text-[#64748B]">
            선택하신 **[A-01]** 급속 충전기를 예약하시겠습니까? 
            <br />
            <span className="text-xs text-[#EF4444] font-semibold">* 노쇼 발생 시 패널티가 부과됩니다.</span>
          </p>

          {/* 버튼들을 나란히 배치 (팀 가이드의 variant 활용) */}
          <div className="flex gap-3 mt-2">
            {/* 취소 버튼: outline 스타일 */}
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setShow(false)}
            >
              취소
            </Button>

            {/* 확인 버튼: primary 스타일 */}
            <Button 
              variant="primary" 
              className="flex-1" 
              onClick={() => {
                alert("예약이 완료되었습니다!");
                setShow(false);
              }}
            >
              예약 확정
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Home;