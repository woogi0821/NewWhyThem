import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// 공지사항 한 건의 구조
interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isPinned: boolean; // Boolean 이므로 is 접두사 사용
}

// 공지 작성 / 수정 시 사용하는 폼 데이터 구조
interface NoticeForm {
  title: string;
  content: string;
  isPinned: boolean;
}

// ─────────────────────────────────────────────
// 임시 데이터 (나중에 API 연결 시 교체)
// ─────────────────────────────────────────────

const INITIAL_NOTICES: Notice[] = [
  { id: "n001", title: "시스템 점검 안내",           content: "2026년 4월 1일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다.",      author: "홍길동", createdAt: "2026.03.30", isPinned: true  },
  { id: "n002", title: "충전 요금 변경 안내",         content: "2026년 4월부터 급속 충전 요금이 일부 조정됩니다.",                   author: "홍길동", createdAt: "2026.03.28", isPinned: true  },
  { id: "n003", title: "신규 충전소 오픈 안내",       content: "강남 코엑스점이 새롭게 오픈했습니다. 많은 이용 부탁드립니다.",       author: "홍길동", createdAt: "2026.03.25", isPinned: false },
  { id: "n004", title: "앱 업데이트 안내 (v2.1.0)",  content: "예약 시스템 개선 및 버그 수정이 포함된 업데이트가 배포되었습니다.", author: "홍길동", createdAt: "2026.03.20", isPinned: false },
  { id: "n005", title: "이벤트 안내 — 첫 충전 무료", content: "신규 회원 가입 후 첫 충전 시 1회 무료 혜택을 드립니다.",            author: "홍길동", createdAt: "2026.03.15", isPinned: false },
];

// ─────────────────────────────────────────────
// 폼 초기값
// ─────────────────────────────────────────────

const EMPTY_FORM: NoticeForm = {
  title: "",
  content: "",
  isPinned: false,
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminNoticePage = () => {

  // ── 상태 관리 ──────────────────────────────

  // 공지 목록 상태 — 추가 / 수정 / 삭제 시 반영
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);

  // 작성 모달 표시 여부
  // Boolean 이므로 is 접두사 사용
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // 수정 모달에서 선택된 공지 — null 이면 모달 닫힘
  const [editNotice, setEditNotice] = useState<Notice | null>(null);

  // 상세 보기에서 선택된 공지 — null 이면 닫힘
  const [detailNotice, setDetailNotice] = useState<Notice | null>(null);

  // 작성 / 수정 폼 데이터
  const [form, setForm] = useState<NoticeForm>(EMPTY_FORM);

  // ── 공지 작성 ──────────────────────────────

  const onAddNotice = () => {
    if (!form.title.trim() || !form.content.trim()) return;

    const newNotice: Notice = {
      // 새 id 생성 — 실제에서는 서버에서 받아옴
      id: "n" + String(notices.length + 1).padStart(3, "0"),
      title: form.title,
      content: form.content,
      author: "홍길동",
      // 오늘 날짜를 YYYY.MM.DD 형식으로 생성
      createdAt: new Date().toLocaleDateString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit"
      }).replace(/\. /g, ".").replace(".", ".").slice(0, 10),
      isPinned: form.isPinned,
    };

    setNotices((prev) => [newNotice, ...prev]);
    setIsWriteModalOpen(false);
    setForm(EMPTY_FORM);
  };

  // ── 공지 수정 ──────────────────────────────

  const onEditNotice = () => {
    if (!editNotice || !form.title.trim() || !form.content.trim()) return;

    // id 가 같은 공지를 찾아서 form 데이터로 교체
    setNotices((prev) =>
      prev.map((n) =>
        n.id === editNotice.id
          ? { ...n, title: form.title, content: form.content, isPinned: form.isPinned }
          : n
      )
    );
    setEditNotice(null);
    setForm(EMPTY_FORM);
  };

  // ── 공지 삭제 ──────────────────────────────

  const onDeleteNotice = (id: string) => {
    // id 가 다른 공지만 남김 → 해당 공지 제거
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  // ── 수정 모달 열기 ──────────────────────────

  const onOpenEditModal = (notice: Notice) => {
    setEditNotice(notice);
    // 현재 공지 데이터로 폼 초기화
    setForm({
      title: notice.title,
      content: notice.content,
      isPinned: notice.isPinned,
    });
  };

  return (
    <AdminLayout adminName="홍길동">

      {/* 페이지 제목 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1 h-6 bg-[#cc0000]" />
        <h1 className="text-lg font-semibold text-gray-800 tracking-wide">
          공지사항
        </h1>
      </div>

      {/* 공지 목록 */}
      <div className="bg-white border border-gray-100 shadow-sm">

        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-[#cc0000]" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
              공지 목록
            </h2>
            <span className="text-xs text-gray-400">
              총 {notices.length}건
            </span>
          </div>

          {/* 공지 작성 버튼 */}
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setIsWriteModalOpen(true);
            }}
            className="px-4 py-2 text-xs text-white bg-[#cc0000] hover:bg-[#aa0000] transition-colors"
          >
            + 공지 작성
          </button>
        </div>

        {/* 공지 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-16">번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">제목</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">작성자</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-28">작성일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-300">
                    등록된 공지사항이 없습니다
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr
                    key={notice.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-400">{notice.id}</td>

                    {/* 제목 — 클릭 시 상세 보기 */}
                    <td
                      className="px-5 py-3 cursor-pointer"
                      onClick={() => setDetailNotice(notice)}
                    >
                      <div className="flex items-center gap-2">
                        {/* 고정 공지 뱃지 */}
                        {notice.isPinned && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-50 text-[#cc0000] font-medium rounded-sm">
                            고정
                          </span>
                        )}
                        <span className="text-gray-700 font-medium hover:text-[#cc0000] transition-colors">
                          {notice.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-gray-500">{notice.author}</td>
                    <td className="px-5 py-3 text-gray-500">{notice.createdAt}</td>

                    {/* 관리 버튼 */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenEditModal(notice)}
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => onDeleteNotice(notice.id)}
                          className="text-xs text-[#cc0000] hover:text-red-800 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 공지 상세 보기 모달 ── */}
      {detailNotice && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setDetailNotice(null)}
        >
          <div
            className="bg-white w-full max-w-lg mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#cc0000]" />
                <h3 className="text-sm font-semibold text-gray-700">공지 상세</h3>
              </div>
              <button
                onClick={() => setDetailNotice(null)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5">
              {/* 제목 */}
              <div className="flex items-center gap-2 mb-3">
                {detailNotice.isPinned && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-50 text-[#cc0000] font-medium rounded-sm">
                    고정
                  </span>
                )}
                <h4 className="text-base font-semibold text-gray-800">
                  {detailNotice.title}
                </h4>
              </div>
              {/* 작성자 / 날짜 */}
              <p className="text-xs text-gray-400 mb-4">
                {detailNotice.author} · {detailNotice.createdAt}
              </p>
              {/* 내용 */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {detailNotice.content}
              </p>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setDetailNotice(null);
                  onOpenEditModal(detailNotice);
                }}
                className="flex-1 py-2 text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                수정
              </button>
              <button
                onClick={() => setDetailNotice(null)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 공지 작성 모달 ── */}
      {isWriteModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setIsWriteModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#cc0000]" />
                <h3 className="text-sm font-semibold text-gray-700">공지 작성</h3>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">

              {/* 제목 입력 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">제목</label>
                <input
                  type="text"
                  placeholder="공지 제목을 입력하세요"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-[#cc0000] outline-none py-2 text-sm text-gray-700 placeholder:text-gray-300"
                />
              </div>

              {/* 내용 입력 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">내용</label>
                <textarea
                  placeholder="공지 내용을 입력하세요"
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  className="w-full border border-gray-200 focus:border-[#cc0000] outline-none p-3 text-sm text-gray-700 placeholder:text-gray-300 resize-none"
                />
              </div>

              {/* 고정 공지 체크박스 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={form.isPinned}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
                  className="accent-[#cc0000]"
                />
                <label htmlFor="isPinned" className="text-xs text-gray-500 cursor-pointer">
                  상단 고정 공지로 설정
                </label>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={onAddNotice}
                className="flex-1 py-2 text-sm text-white bg-[#cc0000] hover:bg-[#aa0000] transition-colors"
              >
                작성 완료
              </button>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 공지 수정 모달 ── */}
      {editNotice && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setEditNotice(null)}
        >
          <div
            className="bg-white w-full max-w-lg mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#cc0000]" />
                <h3 className="text-sm font-semibold text-gray-700">공지 수정</h3>
              </div>
              <button
                onClick={() => setEditNotice(null)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">

              {/* 제목 입력 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">제목</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-[#cc0000] outline-none py-2 text-sm text-gray-700"
                />
              </div>

              {/* 내용 입력 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">내용</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  className="w-full border border-gray-200 focus:border-[#cc0000] outline-none p-3 text-sm text-gray-700 resize-none"
                />
              </div>

              {/* 고정 공지 체크박스 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinnedEdit"
                  checked={form.isPinned}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
                  className="accent-[#cc0000]"
                />
                <label htmlFor="isPinnedEdit" className="text-xs text-gray-500 cursor-pointer">
                  상단 고정 공지로 설정
                </label>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={onEditNotice}
                className="flex-1 py-2 text-sm text-white bg-[#cc0000] hover:bg-[#aa0000] transition-colors"
              >
                수정 완료
              </button>
              <button
                onClick={() => setEditNotice(null)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminNoticePage;