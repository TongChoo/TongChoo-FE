function textLength(value) {
  return Array.from(typeof value === "string" ? value.trim() : "").length;
}

/**
 * 변명 길이가 길수록 단계적으로 글자를 줄인다.
 * featured는 결과·상세 메인 카드, compact는 스레드와 답장 후보에 사용한다.
 */
export function getExcuseTextSizeClass(value, variant = "featured") {
  const length = textLength(value);

  if (variant === "compact") {
    if (length <= 120) return "text-lg";
    if (length <= 220) return "text-base";
    if (length <= 320) return "text-sm";
    return "text-[13px] sm:text-sm";
  }

  if (length <= 120) return "text-xl sm:text-2xl";
  if (length <= 220) return "text-lg sm:text-xl";
  if (length <= 320) return "text-base sm:text-lg";
  return "text-sm sm:text-base";
}

export const excuseTextWrappingClass = "min-w-0 break-words [overflow-wrap:anywhere]";
