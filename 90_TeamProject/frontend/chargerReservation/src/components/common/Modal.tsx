import type { ReactNode, HTMLAttributes } from "react";

// ============================================================
// 타입 정의
// ============================================================

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
type ModalVariant = "default" | "danger" | "success" | "warning";

// ✅ title을 Omit으로 제거하고 재정의
interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  isOpen: boolean;
  isClosableOnOverlay?: boolean;
  hasCloseButton?: boolean;
  onClose: () => void;
  size?: ModalSize;
  variant?: ModalVariant;
  title?: ReactNode;       // 이제 충돌 없음
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

interface ModalHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  hasCloseButton?: boolean;
  onClose?: () => void;
}

interface ModalFooterProps {
  children: ReactNode;
}

interface ModalBodyProps {
  children: ReactNode;
}

// ============================================================
// 스타일 사전 (Dictionary)
// ============================================================

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

const variantHeaderStyles: Record<ModalVariant, string> = {
  default: "border-b border-zinc-200",
  danger:  "border-b border-red-200 bg-red-50",
  success: "border-b border-green-200 bg-green-50",
  warning: "border-b border-yellow-200 bg-yellow-50",
};

const variantIconStyles: Record<ModalVariant, { icon: string; color: string }> = {
  default: { icon: "",   color: "" },
  danger:  { icon: "✕",  color: "text-red-500" },
  success: { icon: "✓",  color: "text-green-500" },
  warning: { icon: "!",  color: "text-yellow-500" },
};

// ============================================================
// 서브 컴포넌트
// ============================================================

export const ModalHeader = ({
  title,
  description,
  hasCloseButton = true,
  onClose,
}: ModalHeaderProps) => {
  if (!title && !description && !hasCloseButton) return null;

  return (
    <div className="flex items-start justify-between gap-4 px-6 py-4">
      <div className="flex flex-col gap-1">
        {title && (
          <h2 className="text-lg font-bold text-zinc-900 leading-snug">{title}</h2>
        )}
        {description && (
          <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
        )}
      </div>
      {hasCloseButton && onClose && (
        <button
          onClick={onClose}
          aria-label="모달 닫기"
          className="shrink-0 mt-0.5 p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export const ModalBody = ({ children }: ModalBodyProps) => (
  <div className="px-6 py-4 text-sm text-zinc-700 leading-relaxed overflow-y-auto max-h-[60vh]">
    {children}
  </div>
);

export const ModalFooter = ({ children }: ModalFooterProps) => (
  <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-100">
    {children}
  </div>
);

// ============================================================
// 공용 모달 컴포넌트 (Main)
// ============================================================

export const Modal = ({
  isOpen,
  isClosableOnOverlay = true,
  hasCloseButton = true,
  onClose,
  size = "md",
  variant = "default",
  title,
  description,
  footer,
  children,
  ...props
}: ModalProps) => {
  if (!isOpen) return null;

  const { icon, color } = variantIconStyles[variant];

  const handleOverlayClick = () => {
    if (isClosableOnOverlay) onClose();
  };

  return (
    // 오버레이
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* 모달 패널 */}
      <div
        className={`
          relative z-10 w-full ${sizeStyles[size]}
          bg-white rounded-2xl shadow-2xl
          flex flex-col overflow-hidden
          animate-[fadeInScale_0.18s_ease_both]
        `}
        {...props}
      >
        {/* variant 아이콘 (default 제외) */}
        {icon && (
          <div className="flex justify-center pt-6 pb-0">
            <span
              className={`
                inline-flex items-center justify-center
                w-12 h-12 rounded-full text-xl font-bold
                ${color}
                ${
                  variant === "danger"
                    ? "bg-red-100"
                    : variant === "success"
                    ? "bg-green-100"
                    : "bg-yellow-100"
                }
              `}
            >
              {icon}
            </span>
          </div>
        )}

        {/* 헤더 */}
        <div className={variantHeaderStyles[variant]}>
          <ModalHeader
            title={title}
            description={description}
            hasCloseButton={hasCloseButton}
            onClose={onClose}
          />
        </div>

        {/* 바디 */}
        <ModalBody>{children}</ModalBody>

        {/* 푸터 */}
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </div>

      {/* 애니메이션 keyframes (Tailwind arbitrary 대신 style tag로 주입) */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
};

export default Modal;