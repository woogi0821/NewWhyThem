import { useId, forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface CheckBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?: "primary" | "danger";
  shape?: "square" | "circle";      // 모양 선택 속성 추가
  children?: ReactNode;
}

export const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  ({ variant = "primary", shape = "circle", children, className = "", id, disabled, ...props }, ref) => {
    
    const generatedId = useId();
    const finalId = id || generatedId;

    // 1. 기본 뼈대 스타일 (공통)
    const baseStyle = `
      w-6 h-6 border-2 transition-all cursor-pointer 
      appearance-none flex-shrink-0 relative 
      focus:ring-2 focus:ring-offset-1 focus:outline-none
      
      /* 체크 아이콘 중앙 정렬 및 스타일 */
      checked:after:content-['✓']
      checked:after:absolute
      checked:after:inset-0
      checked:after:flex
      checked:after:items-center
      checked:after:justify-center
      checked:after:text-white
      checked:after:text-sm
      checked:after:font-bold
    `;

    // 2. 모양(Shape) 딕셔너리
    const shapeStyles = {
      square: "rounded-md",
      circle: "rounded-full",
    };

    // 3. 용도(Variant) 딕셔너리
    const variantStyles = {
      primary: "border-zinc-300 checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-200 group-hover:border-blue-400",
      danger: "border-red-200 checked:bg-red-500 checked:border-red-500 focus:ring-red-200 group-hover:border-red-400",
    };

    const statusStyle = "bg-white disabled:bg-zinc-100 disabled:border-zinc-200 disabled:cursor-not-allowed";

    // 4. 최종 클래스명 조립 (뼈대 + 모양 + 색상)
    const combinedInputClassName = `${baseStyle} ${shapeStyles[shape]} ${statusStyle} ${variantStyles[variant]} ${className}`;

    return (
      <label 
        htmlFor={finalId} 
        className="inline-flex items-center gap-3 cursor-pointer group select-none py-1 w-fit"
      >
        <input
          id={finalId}
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={combinedInputClassName}
          {...props}
        />
        
        {children && (
          <span className={`
            text-zinc-700 font-medium transition-colors
            group-hover:text-zinc-900 
            ${disabled ? "text-zinc-400 cursor-not-allowed" : ""}
          `}>
            {children}
          </span>
        )}
      </label>
    );
  }
);

CheckBox.displayName = "CheckBox";