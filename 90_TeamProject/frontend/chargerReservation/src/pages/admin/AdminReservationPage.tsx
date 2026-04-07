import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// 예약 한 건의 구조
// noshow : 노쇼 처리된 예약 — 백엔드 스케줄러가 자동 감지 후 변경
interface Reservation {
  id: string;
  userName: string;
  stationName: string;
  chargerType: string;
  date: string;
  time: string;
  status: "upcoming" | "ongoing" | "done" | "cancel" | "noshow";
}

// 필터 탭 하나의 구조
interface FilterTab {
  value: Reservation["status"] | "all";
  label: string;
}

// ─────────────────────────────────────────────
// 임시 데이터 (나중에 API 연결 시 교체)
// ─────────────────────────────────────────────

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: "r001", userName: "김민준", stationName: "강남 테헤란로점",     chargerType: "급속 50kW",  date: "2026.03.30", time: "14:00", status: "upcoming" },
  { id: "r002", userName: "이서연", stationName: "송파 잠실점",         chargerType: "급속 100kW", date: "2026.03.30", time: "13:00", status: "ongoing"  },
  { id: "r003", userName: "박지훈", stationName: "마포 홍대점",         chargerType: "완속 7kW",   date: "2026.03.30", time: "12:00", status: "done"     },
  { id: "r004", userName: "최수아", stationName: "서초 반포점",         chargerType: "급속 50kW",  date: "2026.03.30", time: "11:00", status: "cancel"   },
  { id: "r005", userName: "정우성", stationName: "영등포 타임스퀘어점", chargerType: "급속 100kW", date: "2026.03.29", time: "10:00", status: "done"     },
  { id: "r006", userName: "한지민", stationName: "강남 테헤란로점",     chargerType: "완속 7kW",   date: "2026.03.29", time: "09:00", status: "done"     },
  { id: "r007", userName: "오세훈", stationName: "송파 잠실점",         chargerType: "급속 50kW",  date: "2026.03.28", time: "16:00", status: "cancel"   },
  { id: "r008", userName: "윤아름", stationName: "마포 홍대점",         chargerType: "급속 100kW", date: "2026.03.28", time: "15:00", status: "upcoming" },
  // 노쇼 샘플 — 화면 확인용 (API 연결 시 제거)
  { id: "r009", userName: "홍길동", stationName: "서초 반포점",         chargerType: "급속 50kW",  date: "2026.03.27", time: "10:00", status: "noshow"   },
];

// ─────────────────────────────────────────────
// 필터 탭 목록
// ─────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = [
  { value: "all",      label: "전체"   },
  { value: "upcoming", label: "예정"   },
  { value: "ongoing",  label: "진행중" },
  { value: "done",     label: "완료"   },
  { value: "cancel",   label: "취소"   },
  { value: "noshow",   label: "노쇼"   },
];

// ─────────────────────────────────────────────
// 예약 상태별 스타일 딕셔너리
// ─────────────────────────────────────────────

const reservationStatusStyles: {
  [key in "upcoming" | "ongoing" | "done" | "cancel" | "noshow"]: {
    label: string;
    badge: string;
  };
} = {
  upcoming: { label: "예정",   badge: "bg-blue-50 text-blue-600"     },
  ongoing:  { label: "진행중", badge: "bg-green-50 text-green-600"   },
  done:     { label: "완료",   badge: "bg-gray-100 text-gray-500"    },
  cancel:   { label: "취소",   badge: "bg-red-50 text-red-500"       },
  noshow:   { label: "노쇼",   badge: "bg-orange-50 text-orange-600" },
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminReservationPage = () => {

  // ── 상태 관리 ──────────────────────────────

  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterTab["value"]>("all");

  // ── 필터링 ─────────────────────────────────

  const filteredReservations = activeFilter === "all"
    ? reservations
    : reservations.filter((r) => r.status === activeFilter);

  // ── 강제 취소 처리 ──────────────────────────

  const onForceCancel = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "cancel" } : r))
    );
  };

  return (
    <AdminLayout adminName="홍길동">

      {/* 페이지 제목 */}
      <AdminPageHeader title="예약 관리" />

      {/* 예약 목록 */}
      <div className="bg-white border border-gray-100 shadow-sm">

        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* 블루 포인트 라인 — 팀 시안 컬러 통일 */}
            <div className="w-1 h-4 bg-blue-700" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
              예약 목록
            </h2>
            <span className="text-xs text-gray-400">
              총 {filteredReservations.length}건
            </span>
          </div>
        </div>

        {/* 상태별 필터 탭 */}
        <div className="flex border-b border-gray-100">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`
                px-5 py-3 text-xs tracking-wide transition-colors border-b-2
                ${activeFilter === tab.value
                  // 활성 탭 — 블루 텍스트 + 하단 라인
                  ? "text-blue-700 border-b-blue-700 font-medium"
                  : "text-gray-400 border-b-transparent hover:text-gray-600"
                }
              `}
            >
              {tab.label}
              {/* 각 탭의 예약 건수 표시 */}
              <span className="ml-1 text-gray-300">
                {tab.value === "all"
                  ? reservations.length
                  : reservations.filter((r) => r.status === tab.value).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* 예약 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">예약번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">회원명</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전소</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전기 타입</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">예약일</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">시간</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-300">
                    해당 상태의 예약이 없습니다
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => {
                  const style = reservationStatusStyles[reservation.status];
                  return (
                    <tr
                      key={reservation.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-400">{reservation.id}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{reservation.userName}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.stationName}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.chargerType}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.date}</td>
                      <td className="px-5 py-3 text-gray-600">{reservation.time}</td>

                      {/* 상태 뱃지 */}
                      <td className="px-5 py-3">
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-sm
                          ${style.badge}
                        `}>
                          {style.label}
                        </span>
                      </td>

                      {/* 강제 취소 버튼 — upcoming / ongoing 상태일 때만 표시 */}
                      <td className="px-5 py-3">
                        {(reservation.status === "upcoming" || reservation.status === "ongoing") && (
                          <button
                            onClick={() => onForceCancel(reservation.id)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            강제취소
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
};

export default AdminReservationPage;