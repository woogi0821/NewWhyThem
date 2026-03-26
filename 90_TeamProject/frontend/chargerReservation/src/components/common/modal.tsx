// 1. 필요한 도구 임포트 
import React from "react";

// 2. 주문서(Interface) 작성: 팀원들이 모달을 쓸 때 넘겨줄 값들
export interface IModalProps {
  isOpen: boolean;       // 창을 열지(true) 닫을지(false) 결정
  onClose: () => void;   // 닫기 버튼 눌렀을 때 실행할 함수
  title: string;         // 모달 상단 제목
  children: React.ReactNode; // 모달 몸통에 들어갈 내용 (HTML, 다른 컴포넌트 등)
}

function Modal(props: IModalProps) {
  // 3. 구조 분해 할당 
  const { isOpen, onClose, title, children } = props;

  // 4. 조기 리턴: 열림 상태가 아니면 아예 화면에 그리지 않음
  if (!isOpen) return null;

  return (
    <>
      {/* 5. 배경 레이어 (Overlay): 화면 전체를 덮고 반투명하게 만듦 */}
      <div 
        className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
        onClick={onClose} // 배경 클릭 시 닫히게 설정
      >
        {/* 6. 모달 컨테이너 (흰색 박스): 실제 내용이 담기는 곳 */}
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()} // 박스 클릭 시에는 창이 닫히지 않게 방지
        >
          {/* 헤더 영역 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
            >
              &times;
            </button>
          </div>

          {/* 바디 영역: {children} 자리에 팀원이 넣고 싶은 내용이 들어감 */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;