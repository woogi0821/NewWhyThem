import type { HTMLAttributes } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// 메뉴 아이템 하나의 구조
// label : 메뉴에 표시될 텍스트
// path  : 클릭 시 이동할 경로
interface MenuItem {
  label: string;
  path: string;
}

// HTMLAttributes 상속으로 className, style 등 기본 속성 사용 가능
interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  // 현재 로그인한 관리자 이름
  adminName?: string;

  // 로그아웃 버튼 클릭 시 실행할 함수
  // 이벤트 함수이므로 on 접두사 사용
  onLogout?: () => void;
}

// ─────────────────────────────────────────────
// 메뉴 목록 상수
// ─────────────────────────────────────────────

// 메뉴 추가 / 삭제할 때 이 배열만 수정하면 됨
const MENU_ITEMS: MenuItem[] = [
  { label: "대시보드",    path: "/admin" },
  { label: "회원 관리",   path: "/admin/member" },
  { label: "충전기 관리", path: "/admin/charger" },
  { label: "예약 관리",   path: "/admin/reservation" },
  { label: "공지사항",    path: "/admin/notice" },
  { label: "패널티 관리", path: "/admin/penalty" },
  { label: "문의 관리",   path: "/admin/inquiry" },
];

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

export const AdminSidebar = ({
  adminName = "관리자",
  onLogout,
  className = "",
  ...props
}: AdminSidebarProps) => {

  // useNavigate : 메뉴 클릭 시 페이지 이동에 사용
  const navigate = useNavigate();

  // useLocation : 현재 URL 경로를 가져와서 활성 메뉴 판단에 사용
  const location = useLocation();

  return (
    // 사이드바 전체 영역
    // - w-48        : 사이드바 너비 고정 (192px)
    // - min-h-screen: 화면 전체 높이 채움
    // - flex-col    : 내부 요소 세로 배치
    // - border-r    : 우측 라인 (콘텐츠 영역과 구분)
    <aside
      className={`
        w-48 min-h-screen bg-white border-r border-gray-200
        flex flex-col
        ${className}
      `}
      {...props}
    >
      {/* 상단 — 로고 영역 */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        {/* 블루 포인트 라인 — 팀 시안 컬러 통일 */}
        <div className="w-1 h-5 bg-blue-700" />
        <span className="text-sm font-semibold tracking-widest text-gray-800 uppercase">
          Admin
        </span>
      </div>

      {/* 중간 — 메뉴 목록 */}
      {/* flex-1 : 상단 로고와 하단 관리자 정보 사이의 공간을 전부 차지 */}
      <nav className="flex-1 py-4">
        {/* MENU_ITEMS 배열을 순회하며 메뉴 버튼 렌더링 */}
        {MENU_ITEMS.map((item) => {
          // 현재 URL 경로와 메뉴 path 가 같으면 활성화 상태
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full text-left px-5 py-3 text-sm tracking-wide
                transition-colors border-l-2
                ${isActive
                  // 활성화 상태 — 블루 텍스트 + 좌측 라인 + 배경
                  ? "text-blue-700 border-l-blue-700 bg-blue-50 font-medium"
                  // 비활성화 상태 — 회색 텍스트 + 투명 라인
                  : "text-gray-400 border-l-transparent hover:text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 하단 — 관리자 정보 + 로그아웃 */}
      {/* 사이드바 맨 아래에 고정 */}
      <div className="px-5 py-4 border-t border-gray-100">

        {/* 관리자 이름 */}
        <p className="text-xs text-gray-500 tracking-wide mb-2">
          {adminName}
        </p>

        {/* 로그아웃 버튼 */}
        <button
          onClick={onLogout}
          className="text-xs text-gray-400 hover:text-blue-700 tracking-wide transition-colors"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
};