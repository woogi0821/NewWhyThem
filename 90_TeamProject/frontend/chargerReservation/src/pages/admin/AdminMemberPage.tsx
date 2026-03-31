import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// 회원 한 명의 구조
// status : active(정상) / suspended(정지) / withdrawn(탈퇴) 3가지로 제한
interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "suspended" | "withdrawn";
}

// ─────────────────────────────────────────────
// 임시 데이터 (나중에 API 연결 시 교체)
// ─────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: "m001", name: "김민준", email: "minjun@example.com",  phone: "010-1234-5678", joinDate: "2025.01.10", status: "active"    },
  { id: "m002", name: "이서연", email: "seoyeon@example.com", phone: "010-2345-6789", joinDate: "2025.02.14", status: "active"    },
  { id: "m003", name: "박지훈", email: "jihun@example.com",   phone: "010-3456-7890", joinDate: "2025.03.01", status: "suspended" },
  { id: "m004", name: "최수아", email: "sua@example.com",     phone: "010-4567-8901", joinDate: "2025.03.15", status: "active"    },
  { id: "m005", name: "정우성", email: "wusung@example.com",  phone: "010-5678-9012", joinDate: "2025.04.02", status: "withdrawn" },
  { id: "m006", name: "한지민", email: "jimin@example.com",   phone: "010-6789-0123", joinDate: "2025.04.20", status: "active"    },
  { id: "m007", name: "오세훈", email: "sehun@example.com",   phone: "010-7890-1234", joinDate: "2025.05.05", status: "suspended" },
  { id: "m008", name: "윤아름", email: "areum@example.com",   phone: "010-8901-2345", joinDate: "2025.05.18", status: "active"    },
];

// ─────────────────────────────────────────────
// 회원 상태별 스타일 딕셔너리
// ─────────────────────────────────────────────

// Record<Member["status"], ...> 를 쓰는 이유:
// "active" | "suspended" | "withdrawn" 3가지 키가 모두 있어야
// TypeScript 가 통과시킴 → 하나라도 빠지면 에러로 잡아줌
const memberStatusStyles: Record<
  Member["status"],
  { label: string; badge: string }
> = {
  active:    { label: "정상",  badge: "bg-green-50 text-green-600"  },
  suspended: { label: "정지",  badge: "bg-amber-50 text-amber-600"  },
  withdrawn: { label: "탈퇴",  badge: "bg-gray-100 text-gray-400"   },
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminMemberPage = () => {

  // ── 상태 관리 ──────────────────────────────

  // 검색어 상태
  // 입력값에 따라 회원 목록을 실시간으로 필터링
  const [searchQuery, setSearchQuery] = useState("");

  // 선택된 회원 상태
  // null 이면 상세 모달 닫힘 / Member 객체면 모달 열림
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // 회원 목록 상태
  // 정지 / 탈퇴 처리 시 상태를 변경하기 위해 useState 로 관리
  const [members, setMembers] = useState<Member[]>(MEMBERS);

  // ── 검색 필터링 ────────────────────────────

  // searchQuery 가 변경될 때마다 이름 / 이메일 기준으로 필터링
  const filteredMembers = members.filter((m) =>
    m.name.includes(searchQuery) || m.email.includes(searchQuery)
  );

  // ── 회원 상태 변경 함수 ────────────────────

  // 특정 회원의 status 를 변경하는 함수
  // id 로 해당 회원을 찾아서 status 만 교체하고 나머지는 유지
  const onChangeStatus = (id: string, newStatus: Member["status"]) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    // 모달 안의 데이터도 최신 상태로 업데이트
    setSelectedMember((prev) =>
      prev?.id === id ? { ...prev, status: newStatus } : prev
    );
  };

  return (
    <AdminLayout adminName="홍길동">

      {/* 페이지 제목 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1 h-6 bg-[#cc0000]" />
        <h1 className="text-lg font-semibold text-gray-800 tracking-wide">
          회원 관리
        </h1>
      </div>

      {/* 회원 목록 영역 */}
      <div className="bg-white border border-gray-100 shadow-sm">

        {/* 섹션 헤더 — 제목 + 검색창 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

          {/* 좌측 — 섹션 제목 + 총 회원수 */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-[#cc0000]" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
              회원 목록
            </h2>
            {/* 필터링된 회원 수 표시 */}
            <span className="text-xs text-gray-400">
              총 {filteredMembers.length}명
            </span>
          </div>

          {/* 우측 — 검색창 */}
          {/* 이름 또는 이메일로 검색 가능 */}
          <input
            type="text"
            placeholder="이름 또는 이메일 검색"
            value={searchQuery}
            // onChange 이벤트로 searchQuery 상태 업데이트
            // → filteredMembers 가 자동으로 다시 계산됨
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-56 px-3 py-2 text-sm
              border-b border-gray-300 focus:border-[#cc0000]
              outline-none transition-colors
              placeholder:text-gray-300 tracking-wide
            "
          />
        </div>

        {/* 회원 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* 테이블 컬럼 제목 */}
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이름</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">이메일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">가입일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">관리</th>
              </tr>
            </thead>

            {/* 테이블 바디 */}
            <tbody>
              {filteredMembers.length === 0 ? (

                // 검색 결과 없을 때
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    검색 결과가 없습니다
                  </td>
                </tr>

              ) : (
                filteredMembers.map((member) => {
                  // 해당 회원의 status 로 스타일 딕셔너리에서 꺼내옴
                  const style = memberStatusStyles[member.status];

                  return (
                    <tr
                      key={member.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      {/* 이름 — 클릭 시 상세 모달 오픈 */}
                      <td
                        className="px-5 py-3 text-gray-700 font-medium cursor-pointer hover:text-[#cc0000] transition-colors"
                        onClick={() => setSelectedMember(member)}
                      >
                        {member.name}
                      </td>

                      {/* 이메일 */}
                      <td className="px-5 py-3 text-gray-500">
                        {member.email}
                      </td>

                      {/* 가입일 */}
                      <td className="px-5 py-3 text-gray-500">
                        {member.joinDate}
                      </td>

                      {/* 상태 뱃지 */}
                      <td className="px-5 py-3">
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-sm
                          ${style.badge}
                        `}>
                          {style.label}
                        </span>
                      </td>

                      {/* 관리 버튼 */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">

                          {/* 정지 버튼 — 정상 상태일 때만 표시 */}
                          {member.status === "active" && (
                            <button
                              onClick={() => onChangeStatus(member.id, "suspended")}
                              className="text-xs text-amber-500 hover:text-amber-700 transition-colors"
                            >
                              정지
                            </button>
                          )}

                          {/* 정지 해제 버튼 — 정지 상태일 때만 표시 */}
                          {member.status === "suspended" && (
                            <button
                              onClick={() => onChangeStatus(member.id, "active")}
                              className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              정지해제
                            </button>
                          )}

                          {/* 탈퇴 버튼 — 탈퇴 상태가 아닐 때만 표시 */}
                          {member.status !== "withdrawn" && (
                            <button
                              onClick={() => onChangeStatus(member.id, "withdrawn")}
                              className="text-xs text-[#cc0000] hover:text-red-800 transition-colors"
                            >
                              탈퇴
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 회원 상세 모달 ── */}
      {/* selectedMember 가 null 이 아닐 때만 렌더링 */}
      {selectedMember && (

        // 모달 배경 — 클릭 시 모달 닫힘
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setSelectedMember(null)}
        >
          {/* 모달 본체 */}
          {/* e.stopPropagation() : 모달 내부 클릭 시 배경 클릭 이벤트 차단 */}
          <div
            className="bg-white w-full max-w-md mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#cc0000]" />
                <h3 className="text-sm font-semibold text-gray-700">
                  회원 상세 정보
                </h3>
              </div>
              {/* 닫기 버튼 */}
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-300 hover:text-gray-500 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="px-6 py-5 space-y-4">

              {/* 정보 행 컴포넌트 패턴 — label + value */}
              {[
                { label: "이름",   value: selectedMember.name     },
                { label: "이메일", value: selectedMember.email    },
                { label: "연락처", value: selectedMember.phone    },
                { label: "가입일", value: selectedMember.joinDate },
              ].map((row) => (
                <div key={row.label} className="flex items-center border-b border-gray-50 pb-3">
                  <span className="w-20 text-xs text-gray-400 tracking-wide">
                    {row.label}
                  </span>
                  <span className="text-sm text-gray-700">
                    {row.value}
                  </span>
                </div>
              ))}

              {/* 상태 */}
              <div className="flex items-center border-b border-gray-50 pb-3">
                <span className="w-20 text-xs text-gray-400 tracking-wide">
                  상태
                </span>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-sm
                  ${memberStatusStyles[selectedMember.status].badge}
                `}>
                  {memberStatusStyles[selectedMember.status].label}
                </span>
              </div>
            </div>

            {/* 모달 하단 — 처리 버튼 */}
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">

              {/* 정지 버튼 */}
              {selectedMember.status === "active" && (
                <button
                  onClick={() => onChangeStatus(selectedMember.id, "suspended")}
                  className="flex-1 py-2 text-sm text-amber-600 border border-amber-300 hover:bg-amber-50 transition-colors"
                >
                  정지 처리
                </button>
              )}

              {/* 정지 해제 버튼 */}
              {selectedMember.status === "suspended" && (
                <button
                  onClick={() => onChangeStatus(selectedMember.id, "active")}
                  className="flex-1 py-2 text-sm text-blue-600 border border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  정지 해제
                </button>
              )}

              {/* 탈퇴 버튼 */}
              {selectedMember.status !== "withdrawn" && (
                <button
                  onClick={() => onChangeStatus(selectedMember.id, "withdrawn")}
                  className="flex-1 py-2 text-sm text-white bg-[#cc0000] hover:bg-[#aa0000] transition-colors"
                >
                  탈퇴 처리
                </button>
              )}

              {/* 닫기 버튼 */}
              <button
                onClick={() => setSelectedMember(null)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminMemberPage;