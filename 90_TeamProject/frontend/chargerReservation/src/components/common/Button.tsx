import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";// cva 불러오기
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// [공통 유틸리티] 스타일 합치기 (중복 클래스 제거)
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// [CVA 정의] 스타일 변형(Variants)을 한곳에서 관리
const buttonVariants = cva(
  // 1. 공통 기본 스타일 (baseStyle)
  "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      // 2. 용도(variant) 정의
      variant: {
        primary: "bg-green-500 text-white hover:bg-green-600",
        secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
        danger: "bg-red-500 text-white hover:bg-red-600",
        outline: "border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white",
      },
      // 3. 크기(size) 정의
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-3 text-base",
        lg: "px-8 py-4 text-xl",
      },
    },
    // 4. 기본값 설정 (Props가 안 들어왔을 때)
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// [타입 정의] 정의한 Variants에서 타입을 자동으로 추출합니다.
interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>, 
          VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export const Button = ({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button 
      // cva 함수를 호출하여 최종 클래스명을 생성하고, 외부 className과 합침
      className={cn(buttonVariants({ variant, size }), className)} 
      {...props}
    >
      {children}
    </button>
  );
};
