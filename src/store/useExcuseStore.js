import { create } from "zustand";

// 방금 생성하거나 진화한 변명 결과를 화면 이동 사이에 잠깐 보관하는 저장소다.
// 예를 들어 /create에서 변명 생성 성공 → /excuses/result로 이동할 때,
// 결과 화면이 이 latestExcuse를 읽어서 방금 만든 변명을 보여주게 된다.
export const useExcuseStore = create((set) => ({
  latestExcuse: null,

  setLatestExcuse: (excuse) => {
    sessionStorage.setItem("latestExcuse", JSON.stringify(excuse));
    set({ latestExcuse: excuse });
  },

  getStoredLatestExcuse: () => {
    const raw = sessionStorage.getItem("latestExcuse");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      sessionStorage.removeItem("latestExcuse");
      return null;
    }
  },
}));
