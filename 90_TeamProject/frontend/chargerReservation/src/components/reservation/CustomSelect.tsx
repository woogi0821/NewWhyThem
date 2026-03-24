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
    }
    
}