import type { ReactNode, HTMLAttributes } from "react";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// Toast의 종류를 4가지로 제한
// 이 타입 외의 문자열은 TypeScript가 컴파일 에러로 잡아줌
type ToastVariant = "success" | "error" | "warning" | "info";

// Toast가 화면 어느 위치에 나타날지 6가지로 제한
type ToastPosition =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

// ─────────────────────────────────────────────
// Props 인터페이스
// ─────────────────────────────────────────────

// HTMLAttributes<HTMLDivElement> 를 extends 하는 이유:
// onClick, className, style, id 같은 HTML 기본 속성들을
// 일일이 props에 선언하지 않아도 자동으로 사용할 수 있게 상속받음
//
// Omit<..., "children"> 을 쓰는 이유:
// HTMLAttributes 안에도 children이 정의되어 있는데
// 우리가 아래에서 children: ReactNode 로 직접 재정의할 것이기 때문에
// 충돌을 막기 위해 부모 타입에서 children만 제거함
interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  // 토스트 종류 (기본값: "info")
  variant?: ToastVariant;

  // 토스트 위치 (기본값: "top-right")
  position?: ToastPosition;

  // 토스트 표시 여부 - Boolean이므로 필수 규칙에 따라 is 접두사 사용
  isVisible?: boolean;

  // 닫기(X) 버튼 표시 여부 - Boolean이므로 필수 규칙에 따라 has 접두사 사용
  hasCloseButton?: boolean;

  // 토스트 안에 들어갈 내용
  // children을 ReactNode로 받아서 문자열뿐 아니라
  // <strong>저장 완료</strong> 같은 JSX도 넣을 수 있게 함
  children: ReactNode;

  // 닫기 버튼 클릭 또는 자동 닫힘 시 실행할 함수
  // 이벤트 함수이므로 필수 규칙에 따라 on 접두사 사용
  onClose?: () => void;
}

// ─────────────────────────────────────────────
// 스타일 상수
// ─────────────────────────────────────────────

// variant별 Tailwind CSS 클래스를 딕셔너리(객체)로 관리
// 시안 디자인에 맞게 테슬라 레드(#cc0000) 계열을 포인트로 사용
// 흰 배경 + 좌측 컬러 보더 라인으로 언더라인 스타일과 통일감 있게 구성
//
// Record<ToastVariant, ...> 타입은 ToastVariant의 4가지 키가 모두 존재해야 함
// 하나라도 빠지면 TypeScript 에러 → 실수 방지
const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; iconPath: string }
> = {
  success: {
    // 흰 배경 + 좌측 초록 라인 (성공)
    container: "bg-white border-l-4 border-l-green-600 border-t-0 border-r-0 border-b-0",
    icon: "text-green-600",
    // SVG path 데이터 (체크 원형 아이콘)
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    // 흰 배경 + 좌측 테슬라 레드 라인 — 시안의 포인트 컬러와 동일
    container: "bg-white border-l-4 border-l-red-500 border-t-0 border-r-0 border-b-0",
    icon: "text-red-500",
    // SVG path 데이터 (X 원형 아이콘)
    iconPath:
      "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    // 흰 배경 + 좌측 주황 라인 (경고)
    container: "bg-white border-l-4 border-l-yellow-500 border-t-0 border-r-0 border-b-0",
    icon: "text-yellow-500",
    // SVG path 데이터 (삼각형 경고 아이콘)
    iconPath:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  info: {
    // 흰 배경 + 좌측 회색 라인 (안내)
    container: "bg-white border-l-4 border-l-blue-500 border-t-0 border-r-0 border-b-0",
    icon: "text-blue-500",
    // SVG path 데이터 (i 원형 아이콘)
    iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

// position별 Tailwind CSS 위치 클래스를 딕셔너리로 관리
// top-center / bottom-center는 수평 중앙 정렬을 위해
// left-1/2 + -translate-x-1/2 조합을 사용
const positionStyles: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-4 left-4",
};

// 모든 variant에 공통으로 적용되는 뼈대 스타일
// - fixed        : 스크롤에 영향 없이 화면에 고정
// - z-50         : 다른 요소들 위에 떠 있도록 z-index 설정
// - flex / gap   : 아이콘 + 텍스트 + 닫기버튼 가로 배치
// - shadow-md    : 시안의 카드 느낌과 통일감 있게 그림자 적용
// - rounded-none : 시안의 각진 스타일에 맞게 둥글기 제거
// - transition   : isVisible 변경 시 부드러운 애니메이션
const baseStyle =
  "fixed z-50 flex items-center gap-3 px-5 py-4 rounded-none shadow-md min-w-[280px] max-w-sm transition-all duration-300 border";

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

export const Toast = ({
  variant = "info",        // 기본값: info
  position = "top-right",  // 기본값: 우상단
  isVisible = true,        // 기본값: 보임
  hasCloseButton = true,   // 기본값: 닫기버튼 있음
  children,
  onClose,
  className = "",
  // ...props: 위에서 명시한 props 외에 전달된 나머지 HTML 속성들
  // 예) id="my-toast" style={{ marginTop: 10 }} 등을 그대로 div에 전달
  ...props
}: ToastProps) => {

  // variant에 해당하는 스타일 객체를 꺼내옴
  const { container, icon, iconPath } = variantStyles[variant];

  // 최종 className 조합
  // 1) baseStyle      : 공통 뼈대
  // 2) container      : variant별 색상 + 좌측 라인
  // 3) positionStyles : position별 위치
  // 4) 애니메이션     : isVisible이 true면 보임, false면 위로 사라짐
  // 5) className      : 외부에서 추가로 전달한 클래스 (확장 가능)
  const combinedClassName = `
    ${baseStyle}
    ${container}
    ${positionStyles[position]}
    ${
      isVisible
        ? "opacity-100 translate-y-0"                    // 보이는 상태
        : "opacity-0 -translate-y-2 pointer-events-none" // 숨김 상태 (클릭도 막음)
    }
    ${className}
  `;

  return (
    // role="alert"      : 스크린리더가 토스트 내용을 자동으로 읽어줌 (접근성)
    // aria-live="polite": 현재 읽고 있는 내용이 끝난 후 알림 (접근성)
    // {...props}        : id, style 등 외부에서 넘긴 나머지 속성 전달
    <div role="alert" aria-live="polite" className={combinedClassName} {...props}>

      {/* 아이콘 영역 */}
      {/* aria-hidden="true": 아이콘은 장식용이라 스크린리더가 읽지 않도록 숨김 */}
      <svg
        className={`w-5 h-5 shrink-0 ${icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {/* variant에 따라 iconPath가 달라져서 아이콘 모양이 바뀜 */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconPath}
        />
      </svg>

      {/* 메시지 영역 */}
      {/* children으로 구멍을 뚫어뒀기 때문에 */}
      {/* 문자열이든 JSX든 자유롭게 넣을 수 있음 */}
      <div className="flex-1 text-sm font-medium tracking-wide text-gray-700">
        {children}
      </div>

      {/* 닫기 버튼 */}
      {/* hasCloseButton이 false면 아예 렌더링하지 않음 */}
      {hasCloseButton && (
        <button
          onClick={onClose}
          aria-label="닫기" // 스크린리더용 버튼 설명
          className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {/* X 아이콘 (두 대각선) */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};