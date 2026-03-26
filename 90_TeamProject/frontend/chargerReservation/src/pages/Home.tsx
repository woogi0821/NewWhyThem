import React from "react";
import Modal from "../components/common/modal";

// 테스트용
export function Home() {
  const [show, setShow] = React.useState(true); // 모달 제어 상태, false-> true로 바꿈

  return (
    <div>
      <button onClick={() => setShow(true)}>모달 테스트 버튼</button>
      
      {/* 모달 호출 */}
      <Modal 
        isOpen={show} 
        onClose={() => setShow(false)} 
        title="알림창 테스트"
      >
        <p>모달 테스트</p>
        <button className="bg-blue-500 text-white p-2 mt-4" onClick={() => setShow(false)}>닫기</button>
      </Modal>
    </div>
  );
}
export default Home;