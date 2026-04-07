import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminLoginPage = () => {
  const navigate = useNavigate();

  // ── 상태 관리 ──────────────────────────────

  // 아이디 / 비밀번호 입력값
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  // 에러 메시지 상태
  // 로그인 실패 시 표시
  const [errorMsg, setErrorMsg] = useState("");

  // ── 로그인 처리 ─────────────────────────────

  const onLogin = () => {
    // 임시 로그인 — 나중에 API 연결 시 교체
    // 현재는 아이디/비밀번호 둘 다 "admin" 이면 통과
    if (id === "admin" && password === "admin") {
      // localStorage 에 임시 토큰 저장
      // 나중에 서버에서 받은 JWT 토큰으로 교체
      localStorage.setItem("adminToken", "temp_admin_token");
      navigate("/admin");
    } else {
      setErrorMsg("아이디 또는 비밀번호가 올바르지 않습니다");
    }
  };

  // 엔터키로도 로그인 가능하도록
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm mx-4 shadow-sm border border-gray-100">

        {/* 헤더 */}
        <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-100">
          {/* 블루 포인트 라인 — 팀 시안 컬러 통일 */}
          <div className="w-1 h-5 bg-blue-700" />
          <span className="text-sm font-semibold tracking-widest text-gray-800 uppercase">
            Admin
          </span>
        </div>

        {/* 로그인 폼 */}
        <div className="px-8 py-6 space-y-4">

          {/* 아이디 입력 */}
          <div>
            <label className="block text-xs text-gray-400 tracking-wide mb-1">
              아이디
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="아이디를 입력하세요"
              className="
                w-full border-b border-gray-300 focus:border-blue-700
                outline-none py-2 text-sm text-gray-700
                placeholder:text-gray-300 tracking-wide
              "
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-xs text-gray-400 tracking-wide mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="비밀번호를 입력하세요"
              className="
                w-full border-b border-gray-300 focus:border-blue-700
                outline-none py-2 text-sm text-gray-700
                placeholder:text-gray-300 tracking-wide
              "
            />
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="text-xs text-blue-700 tracking-wide">
              {errorMsg}
            </p>
          )}
        </div>

        {/* 로그인 버튼 */}
        <div className="px-8 pb-6">
          <button
            onClick={onLogin}
            className="w-full py-2.5 text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;