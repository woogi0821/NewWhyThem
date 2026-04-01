import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface AdminLayoutProps {
  // 레이아웃 안에 들어갈 페이지 내용
  // children으로 구멍을 뚫어두어 어떤 페이지든 감쌀 수 있게 함
  children: ReactNode;

  // 현재 로그인한 관리자 이름
  adminName?: string;
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

export const AdminLayout = ({
  children,
  adminName = "관리자",
}: AdminLayoutProps) => {

  // useNavigate : 로그아웃 시 페이지 이동에 사용
  const navigate = useNavigate();

  // 로그아웃 처리
  // 실제 프로젝트에서는 토큰 삭제 등 추가 작업 필요
  const onLogout = () => {
    navigate("/");
  };

  return (
    // 전체 화면을 가로로 꽉 채움
    // - flex     : 사이드바 + 콘텐츠 영역 가로 배치
    // - min-h-screen : 화면 전체 높이 채움
    <div className="flex min-h-screen bg-gray-50">

      {/* 사이드바 — 좌측 고정 */}
      {/* useNavigate, useLocation 은 AdminSidebar 내부에서 처리 */}
      <AdminSidebar
        adminName={adminName}
        onLogout={onLogout}
      />

      {/* 페이지 내용 영역 */}
      {/* flex-1 : 사이드바를 제외한 나머지 공간을 전부 차지 */}
      {/* overflow-y-auto : 내용이 길어지면 세로 스크롤 */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* children 으로 각 페이지 내용이 들어옴 */}
        {children}
      </main>

    </div>
  );
};