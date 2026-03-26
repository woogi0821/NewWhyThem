import { useState } from "react";

export interface SelectOption {
    label : string; //화면에 표시될 글자
    value : string; //백엔드로 보낼 데이터
}

interface CustomSelectProps {
    options : SelectOption[]; //드롭다운시 보여줄 선택지
    value? : string; //현재 선택된 값
    placeholder? : string; //아무것도 선택하지 않았을때 기본 문구
    onChange : (value : string) => void; //무언가 선택했을때 알리는 함수
}

export const CustomSelect = ({
    options,
    value,
    placeholder = "선택해주세요",
    onChange
} : CustomSelectProps) => {
    //상태관리 -> 드롭다운 리스트가 열렸는지 닫혔는지 기억하는 상태(기본값 : 닫힘)
    const [isOpen, setIsOpen] = useState<boolean>(false);

    //현재 선택된 vlaue를 가지고 화면에 보여줄 label을 찾는 함수
    //value가 station_Id라면 options배열에서 station_Id중 받아온 데이터를 출력해주는 함수
    const selectedLabel = options.find((opt)=> opt.value === value)?.label;

    //셀렉트 박스 토글 함수
    const handleToggle = () => {
        setIsOpen(!isOpen);
    }

    const handleSelect = (selectedValue : string) => {
        onChange(selectedValue); //부모페이지(조립된 페이지)에 선택 알림
        setIsOpen(false); // 드롭다운 리스트를 다시 닫는 함수
    };
return (
    // 이 박스를 relative(기준점)로 잡아야, 나중에 열리는 리스트가 이 박스 바로 밑에 찰싹 붙습니다.
    <div className="relative w-full">
      
      {/* 1. 눈에 보이는 '가짜' 셀렉트 버튼 */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 hover:border-green-500 transition-colors"
      >
        {/* 선택된 값이 있으면 그걸 보여주고, 없으면 placeholder를 회색으로 보여줍니다. */}
        <span className={selectedLabel ? "text-white" : "text-zinc-400"}>
          {selectedLabel || placeholder}
        </span>
        
        {/* 오른쪽에 달린 화살표 아이콘 (열렸을 땐 위로, 닫혔을 땐 아래로 회전) */}
        <span className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              // 마우스를 올리면 배경색이 초록색으로 변하게 합니다.
              className={`px-4 py-3 cursor-pointer transition-colors hover:bg-green-600 hover:text-white ${
                // 현재 선택된 항목이면 색깔을 다르게 표시해 줍니다.
                option.value === value ? "bg-green-500 text-white font-bold" : "text-zinc-200"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      
    </div>
  );
}