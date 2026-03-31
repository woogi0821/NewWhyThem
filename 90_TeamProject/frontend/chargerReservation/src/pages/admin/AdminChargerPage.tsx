import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// 충전소 하나의 구조
interface Station {
  id: string;
  name: string;
  address: string;
  totalChargers: number;
}

// 충전기 한 대의 구조
interface Charger {
  id: string;
  stationId: string;  // 소속 충전소 id — Station 과 연결
  type: string;
  status: "free" | "busy" | "error";
}

// 충전기 추가 / 수정 시 사용하는 폼 데이터 구조
interface ChargerForm {
  stationId: string;
  type: string;
  status: Charger["status"];
}

// ─────────────────────────────────────────────
// 임시 데이터 (나중에 API 연결 시 교체)
// ─────────────────────────────────────────────

const STATIONS: Station[] = [
  { id: "s001", name: "강남 테헤란로점",     address: "서울 강남구 테헤란로 152", totalChargers: 3 },
  { id: "s002", name: "송파 잠실점",         address: "서울 송파구 올림픽로 300", totalChargers: 2 },
  { id: "s003", name: "마포 홍대점",         address: "서울 마포구 양화로 188",   totalChargers: 2 },
  { id: "s004", name: "서초 반포점",         address: "서울 서초구 반포대로 58",  totalChargers: 1 },
  { id: "s005", name: "영등포 타임스퀘어점", address: "서울 영등포구 영중로 15",  totalChargers: 2 },
];

const INITIAL_CHARGERS: Charger[] = [
  { id: "c001", stationId: "s001", type: "급속 50kW",  status: "free"  },
  { id: "c002", stationId: "s001", type: "급속 50kW",  status: "busy"  },
  { id: "c003", stationId: "s001", type: "급속 100kW", status: "free"  },
  { id: "c004", stationId: "s002", type: "급속 100kW", status: "busy"  },
  { id: "c005", stationId: "s002", type: "완속 7kW",   status: "free"  },
  { id: "c006", stationId: "s003", type: "급속 50kW",  status: "error" },
  { id: "c007", stationId: "s003", type: "완속 7kW",   status: "busy"  },
  { id: "c008", stationId: "s004", type: "급속 50kW",  status: "free"  },
  { id: "c009", stationId: "s005", type: "급속 100kW", status: "free"  },
  { id: "c010", stationId: "s005", type: "완속 7kW",   status: "error" },
];

// ─────────────────────────────────────────────
// 스타일 딕셔너리
// ─────────────────────────────────────────────

const chargerStatusStyles: Record<
  Charger["status"],
  { label: string; dot: string; badge: string }
> = {
  free:  { label: "가용",   dot: "bg-green-500", badge: "bg-green-50 text-green-600" },
  busy:  { label: "사용중", dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-600"  },
  error: { label: "고장",   dot: "bg-[#cc0000]", badge: "bg-red-50 text-[#cc0000]"  },
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminChargerPage = () => {

  // ── 상태 관리 ──────────────────────────────

  // 충전기 목록 상태 — 추가 / 수정 / 삭제 시 반영
  const [chargers, setChargers] = useState<Charger[]>(INITIAL_CHARGERS);

  // 선택된 충전소 — null 이면 전체 충전기 표시
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // 추가 모달 표시 여부
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 수정 모달에서 선택된 충전기 — null 이면 모달 닫힘
  const [editCharger, setEditCharger] = useState<Charger | null>(null);

  // 추가 / 수정 폼 데이터
  const [form, setForm] = useState<ChargerForm>({
    stationId: "",
    type: "급속 50kW",
    status: "free",
  });

  // ── 충전기 필터링 ───────────────────────────

  // selectedStationId 가 있으면 해당 충전소 충전기만 표시
  // null 이면 전체 표시
  const filteredChargers = selectedStationId
    ? chargers.filter((c) => c.stationId === selectedStationId)
    : chargers;

  // ── 상태별 집계 ─────────────────────────────

  // 필터링된 충전기 기준으로 상태별 대수 집계
  const freeCount  = filteredChargers.filter((c) => c.status === "free").length;
  const busyCount  = filteredChargers.filter((c) => c.status === "busy").length;
  const errorCount = filteredChargers.filter((c) => c.status === "error").length;

  // ── 충전기 추가 ─────────────────────────────

  const onAddCharger = () => {
    // 새 충전기 id 생성 — 실제에서는 서버에서 받아옴
    const newId = "c" + String(chargers.length + 1).padStart(3, "0");
    const newCharger: Charger = { id: newId, ...form };
    setChargers((prev) => [...prev, newCharger]);
    setIsAddModalOpen(false);
    // 폼 초기화
    setForm({ stationId: "", type: "급속 50kW", status: "free" });
  };

  // ── 충전기 수정 ─────────────────────────────

  const onEditCharger = () => {
    if (!editCharger) return;
    // id 가 같은 충전기를 찾아서 form 데이터로 교체
    setChargers((prev) =>
      prev.map((c) => (c.id === editCharger.id ? { ...c, ...form } : c))
    );
    setEditCharger(null);
  };

  // ── 충전기 삭제 ─────────────────────────────

  const onDeleteCharger = (id: string) => {
    // id 가 다른 충전기만 남김 → 해당 충전기 제거
    setChargers((prev) => prev.filter((c) => c.id !== id));
  };

  // ── 수정 모달 열기 ──────────────────────────

  const onOpenEditModal = (charger: Charger) => {
    setEditCharger(charger);
    // 현재 충전기 데이터로 폼 초기화
    setForm({
      stationId: charger.stationId,
      type: charger.type,
      status: charger.status,
    });
  };

  return (
    <AdminLayout adminName="홍길동">

      {/* 페이지 제목 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1 h-6 bg-[#cc0000]" />
        <h1 className="text-lg font-semibold text-gray-800 tracking-wide">
          충전소 / 충전기 관리
        </h1>
      </div>

      {/* ── 충전소 목록 ── */}
      <div className="bg-white border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-1 h-4 bg-[#cc0000]" />
          <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
            충전소 목록
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전소명</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">주소</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전기 수</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">필터</th>
              </tr>
            </thead>
            <tbody>
              {STATIONS.map((station) => (
                <tr
                  key={station.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3 text-gray-700 font-medium">{station.name}</td>
                  <td className="px-5 py-3 text-gray-500">{station.address}</td>
                  <td className="px-5 py-3 text-gray-500">{station.totalChargers}대</td>
                  <td className="px-5 py-3">
                    {/* 충전소 선택 시 해당 충전소 충전기만 필터링 */}
                    <button
                      onClick={() =>
                        setSelectedStationId(
                          selectedStationId === station.id ? null : station.id
                        )
                      }
                      className={`
                        text-xs px-3 py-1 border transition-colors
                        ${selectedStationId === station.id
                          ? "border-[#cc0000] text-[#cc0000] bg-red-50"
                          : "border-gray-200 text-gray-400 hover:border-[#cc0000] hover:text-[#cc0000]"
                        }
                      `}
                    >
                      {selectedStationId === station.id ? "필터 해제" : "필터"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 충전기 현황 ── */}
      <div className="bg-white border border-gray-100 shadow-sm">

        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#cc0000]" />
              <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
                충전기 현황
              </h2>
            </div>
            {/* 상태별 요약 */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                가용 {freeCount}대
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                사용중 {busyCount}대
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#cc0000] inline-block" />
                고장 {errorCount}대
              </span>
            </div>
          </div>

          {/* 충전기 추가 버튼 */}
          <button
            onClick={() => {
              setForm({ stationId: "", type: "급속 50kW", status: "free" });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs text-white bg-[#cc0000] hover:bg-[#aa0000] transition-colors"
          >
            + 충전기 추가
          </button>
        </div>

        {/* 충전기 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전기 번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">충전소</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">타입</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">상태</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredChargers.map((charger) => {
                const style = chargerStatusStyles[charger.status];
                // stationId 로 충전소 이름 찾기
                const stationName = STATIONS.find((s) => s.id === charger.stationId)?.name ?? "-";

                return (
                  <tr
                    key={charger.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-400">{charger.id}</td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{stationName}</td>
                    <td className="px-5 py-3 text-gray-600">{charger.type}</td>
                    <td className="px-5 py-3">
                      <span className={`
                        inline-flex items-center gap-1.5
                        px-2 py-1 text-xs font-medium rounded-sm
                        ${style.badge}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* 수정 버튼 */}
                        <button
                          onClick={() => onOpenEditModal(charger)}
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          수정
                        </button>
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => onDeleteCharger(charger.id)}
                          className="text-xs text-[#cc0000] hover:text-red-800 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 충전기 추가 모달 ── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#cc0000]" />
                <h3 className="text-sm font-semibold text-gray-700">충전기 추가</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">

              {/* 충전소 선택 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">충전소</label>
                <select
                  value={form.stationId}
                  onChange={(e) => setForm((prev) => ({ ...prev, stationId: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-[#cc0000] outline-none py-2 text-sm text-gray-700"
                >
                  <option value="">충전소 선택</option>
                  {STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* 충전기 타입 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">타입</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-[#cc0000] outline-none py-2 text-sm text-gray-700"
                >
                  <option value="급속 50kW">급속 50kW</option>
                  <option value="급속 100kW">급속 100kW</option>
                  <option value="완속 7kW">완속 7kW</option>
                </select>
              </div>

              {/* 초기 상태 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">상태</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Charger["status"] }))}
                  className="w-full border-b border-gray-300 focus:border-[#cc0000] outline-none py-2 text-sm text-gray-700"
                >
                  <option value="free">가용</option>
                  <option value="busy">사용중</option>
                  <option value="error">고장</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={onAddCharger}
                className="flex-1 py-2 text-sm text-white bg-[#cc0000] hover:bg-[#aa0000] transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2 text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 충전기 수정 모달 ── */}
      {editCharger && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setEditCharger(null)}
        >
          <div
            className="bg-white w-full max-w-sm mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#cc0000]" />
                <h3 className="text-sm font-semibold text-gray-700">충전기 수정</h3>
              </div>
              <button
                onClick={() => setEditCharger(null)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">

              {/* 충전소 선택 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">충전소</label>
                <select
                  value={form.stationId}
                  onChange={(e) => setForm((prev) => ({ ...prev, stationId: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-[#cc0000] outline-none py-2 text-sm text-gray-700"
                >
                  {STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* 충전기 타입 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">타입</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full border-b border-gray-300 focus:border-[#cc0000] outline-none py-2 text-sm text-gray-700"
                >
                  <option value="급속 50kW">급속 50kW</option>
                  <option value="급속 100kW">급속 100kW</option>
                  <option value="완속 7kW">완속 7kW</option>
                </select>
              </div>

              {/* 상태 */}
              <div>
                <label className="block text-xs text-gray-400 tracking-wide mb-1">상태</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Charger["status"] }))}
                  className="w-full border-b border-gray-300 focus:border-[#cc0000] outline-none py-2 text-sm text-gray-700"
                >
                  <option value="free">가용</option>
                  <option value="busy">사용중</option>
                  <option value="error">고장</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={onEditCharger}
                className="flex-1 py-2 text-sm text-white bg-[#cc0000] hover:bg-[#aa0000] transition-colors"
              >
                수정 완료
              </button>
              <button
                onClick={() => setEditCharger(null)}
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

export default AdminChargerPage;