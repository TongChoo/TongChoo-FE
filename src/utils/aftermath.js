const englishWhenLabels = {
  "same day": "당일",
  today: "오늘",
  "next day": "다음 날",
  tomorrow: "내일",
  "day after tomorrow": "모레",
  "same week": "이번 주",
  "next week": "다음 주",
  "one week later": "일주일 후",
};

export function formatAftermathWhen(when, dayOffset) {
  const value = typeof when === "string" ? when.trim() : "";
  const translated = englishWhenLabels[value.toLowerCase()];

  if (translated) return translated;
  if (value && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) return value;

  if (Number.isInteger(dayOffset)) {
    if (dayOffset === 0) return "당일";
    if (dayOffset === 1) return "다음 날";
    return `${dayOffset}일 후`;
  }

  return value || "시점 미정";
}
