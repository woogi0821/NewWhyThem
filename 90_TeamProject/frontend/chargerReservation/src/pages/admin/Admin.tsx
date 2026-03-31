import { AdminLayout } from "../../components/admin/AdminLayout";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// 통계 카드 하나의 구조
// label : 카드 제목
// value : 표시할 숫자 값
// unit  : 숫자 뒤에 붙는 단위
interface StatCard {
  label: string;
  value: string;
  unit: string;
}

// ─────────────────────────────────────────────
// 임시 데이터 (나중에 API 연결 시 교체)
// ─────────────────────────────────────────────

// 대시보드 통계 카드 — 오늘 예약 건수 / 총 회원수 2개만
const STAT_CARDS: StatCard[] = [
  { label: "총 회원수",    value: "1,284", unit: "명" },
  { label: "오늘 예약",    value: "38",    unit: "건" },
];

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

const AdminPage = () => {
  return (
    // AdminLayout 으로 감싸면
    // 사이드바 + 페이지 내용 구조가 자동으로 완성됨
    <AdminLayout adminName="홍길동">

      {/* 페이지 제목 */}
      {/* 테슬라 레드 포인트 라인 + 제목 텍스트 — 시안 스타일 통일 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1 h-6 bg-[#cc0000]" />
        <h1 className="text-lg font-semibold text-gray-800 tracking-wide">
          대시보드
        </h1>
      </div>

      {/* 통계 카드 영역 */}
      {/* grid-cols-2 : 카드 2개를 가로로 배치 */}
      {/* max-w-lg    : 카드가 너무 넓어지지 않도록 최대 너비 제한 */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 p-6 shadow-sm"
          >
            {/* 카드 제목 */}
            <p className="text-xs text-gray-400 tracking-wide mb-3">
              {card.label}
            </p>

            {/* 값 + 단위를 가로로 배치 */}
            {/* items-baseline : 숫자와 단위의 기준선을 맞춤 */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-gray-800">
                {card.value}
              </span>
              <span className="text-xs text-gray-400">
                {card.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

    </AdminLayout>
  );
};

export default AdminPage;