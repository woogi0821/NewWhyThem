import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "search" | "subSearch";
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode; // 아이콘 추가를 위한 구멍
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "default",
      size = "md",
      leftIcon,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const baseStyle =
      "w-full transition-all outline-none disabled:cursor-not-allowed";

    const variantStyles = {
      default: `border-2 rounded-xl placeholder:text-zinc-400 ${
        error
          ? "border-red-500 focus:ring-red-100"
          : "border-zinc-200 focus:border-blue-500 focus:ring-blue-100 focus:ring-blue-50"
      } focus:ring-2`,
      search: `
        bg-white
        rounded-2xl
        placeholder:text-zinc-400 font-bold
        border-3 border-blue-100 shadow-none
        focus:border-blue-500
        focus:ring-4 focus:ring-blue-50
        transition-all duration-200
      `,
      subSearch: `
        border border-zinc-200
        placeholder:text-zinc-400 text-sm
        transition-all
      `,
    };

    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-5 py-4 text-lg",
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-bold text-zinc-700 ml-1">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}

        {/* 아이콘 배치를 위해 relative 컨테이너 추가 */}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-5 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${leftIcon ? "pl-14" : ""} ${className}`}
            {...props}
          />
        </div>

        {(error || helperText) && (
          <span
            className={`text-xs ml-1 font-medium ${error ? "text-red-500" : "text-zinc-500"}`}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
