import { Toast } from "../../components/common/Toast";
import { useToast } from "../../components/common/useToast";

const ToastTestPage = () => {
  const { toast, hideToast, success, error, warning, info } = useToast();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">

      {/* success 버튼 */}
      <button
        onClick={() => success("저장이 완료되었습니다.")}
        className="w-48 py-2 bg-[#1D4ED8] text-white text-sm font-medium tracking-wide hover:bg-[#1e40af] transition-colors"
      >
        SUCCESS
      </button>

      {/* error 버튼 */}
      <button
        onClick={() => error("아이디 또는 비밀번호를 확인해주세요.")}
        className="w-48 py-2 bg-[#EF4444] text-white text-sm font-medium tracking-wide hover:bg-[#dc2626] transition-colors"
      >
        ERROR
      </button>

      {/* warning 버튼 */}
      <button
        onClick={() => warning("입력하지 않은 항목이 있습니다.")}
        className="w-48 py-2 bg-[#F59E0B] text-white text-sm font-medium tracking-wide hover:bg-[#d97706] transition-colors"
      >
        WARNING
      </button>

      {/* info 버튼 */}
      <button
        onClick={() => info("새로운 알림이 있습니다.")}
        className="w-48 py-2 bg-[#0F172A] text-white text-sm font-medium tracking-wide hover:bg-[#1e293b] transition-colors"
      >
        INFO
      </button>

      {/* Toast 컴포넌트 — 페이지 맨 아래에 한 번만 */}
      {/* position 을 직접 고정하지 않고 toast.position 으로 받아서 */}
      {/* useToast.ts 의 기본값 (bottom-center) 을 자동으로 따라감 */}
      <Toast
        variant={toast.variant}
        position={toast.position}
        isVisible={toast.isVisible}
        onClose={hideToast}
      >
        {toast.message}
      </Toast>

    </div>
  );
};

export default ToastTestPage;