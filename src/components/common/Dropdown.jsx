import { useEffect, useId, useRef, useState } from "react";

// Design.md §5.6 기준 커스텀 드롭다운.
// 브라우저 기본 <select>는 OS마다 모양이 달라서 우리 디자인과 어긋날 수 있다.
// 그래서 버튼 + 리스트박스로 직접 만들고, 값은 React state로 관리한다.
export default function Dropdown({
  label,
  placeholder = "선택하세요",
  value,
  options,
  onChange,
  panelClassName = "absolute left-0 right-0 top-full z-20 mt-1.5 bg-white border border-border-soft rounded-md shadow-[0_8px_24px_rgba(11,42,85,0.10)] py-1",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const labelId = useId();
  const selectedOption = options.find((option) => option.code === value);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <span id={labelId} className="sr-only">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 rounded-md border border-border-input bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition"
      >
        <span className={selectedOption ? "text-navy-900" : "text-[#a3b2c7]"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-navy-300 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className={panelClassName}
        >
          {options.map((option) => {
            const isSelected = option.code === value;

            return (
              <li key={option.code} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.code);
                    setIsOpen(false);
                  }}
                  className={
                    isSelected
                      ? "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-medium text-white bg-brand-primary cursor-pointer"
                      : "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-normal text-navy-900 hover:bg-surface-soft cursor-pointer"
                  }
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
