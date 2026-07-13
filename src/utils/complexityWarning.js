const LEGACY_WARNING_MESSAGES = {
  "대화가 길어지고 있어. 이전 답변과 말이 충돌하지 않게 조심해.":
    "답장 대화가 길어져 이전 내용과 충돌할 가능성이 있습니다. 새로운 내용을 추가하기 전에 기존 답변의 이유와 약속을 확인해 주세요.",
  "최대 라운드에 가까워졌어. 추가 변명보다 수습 전략으로 전환하는 게 안전해.":
    "답장 가능 횟수의 마지막 단계입니다. 추가 변명보다는 사실을 인정하고 구체적인 해결 방법을 전달하는 것을 권장합니다.",
};

export function getComplexityWarningMessage(message) {
  return LEGACY_WARNING_MESSAGES[message] ?? message;
}
