import { Toast } from "../../components/common/Toast";
import { useToast } from "../../components/common/useToast";

const ToastTestPage = () => {
  const { toast, hideToast, success, error, warning, info } = useToast();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">

      {/* success 버튼 */}
      <button
        onClick={() => success("저장이 완료되었습니다.")}
        className="w-48 py-2 bg-green-600 text-white text-sm font-medium tracking-wide hover:bg-green-700 transition-colors"
      >
        SUCCESS
      </button>

      {/* error 버튼 — 테슬라 레드 */}
      <button
        onClick={() => error("아이디 또는 비밀번호를 확인해주세요.")}
        className="w-48 py-2 bg-red-600 text-white text-sm font-medium tracking-wide hover:bg-red-700 transition-colors"
      >
        ERROR
      </button>

      {/* warning 버튼 */}
      <button
        onClick={() => warning("입력하지 않은 항목이 있습니다.")}
        className="w-48 py-2 bg-yellow-500 text-white text-sm font-medium tracking-wide hover:bg-yellow-600 transition-colors"
      >
        WARNING
      </button>

      {/* info 버튼 */}
      <button
        onClick={() => info("새로운 알림이 있습니다.")}
        className="w-48 py-2 bg-blue-500 text-white text-sm font-medium tracking-wide hover:bg-blue-700 transition-colors"
      >
        INFO
      </button>

      {/* Toast 컴포넌트 — 페이지 맨 아래에 한 번만 */}
      <Toast
        variant={toast.variant}
        position="bottom-center"
        isVisible={toast.isVisible}
        onClose={hideToast}
      >
        {toast.message}
      </Toast>

    </div>
  );
};

export default ToastTestPage;