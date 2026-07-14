import { apiClient } from "./client";

export const excuseApi = {
  getMyExcuses: ({ page = 0, size = 10 } = {}) =>
    apiClient.get(`/api/excuses?page=${page}&size=${size}`),

  getExcuse: (excuseId) =>
    apiClient.get(`/api/excuses/${excuseId}`),

  createExcuse: ({ situation, target, targetDescription, tone }) =>
    apiClient.post("/api/excuses", {
      situation,
      target,
      tone,
      ...(target === "CUSTOM" ? { targetDescription } : {}),
    }),

  replyToExcuse: ({ excuseId, incomingMessage, currentExcuse }) =>
    apiClient.post(`/api/excuses/${excuseId}/reply`, {
      incomingMessage,
      currentExcuse,
    }),

  selectReplyOption: ({ excuseId, selectedExcuse }) =>
    apiClient.patch(`/api/excuses/${excuseId}/selection`, {
      selectedExcuse,
    }),
};
