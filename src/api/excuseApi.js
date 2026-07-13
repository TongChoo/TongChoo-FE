import { apiClient } from "./client";

export const excuseApi = {
  getMyExcuses: ({ page = 0, size = 10 } = {}) =>
    apiClient.get(`/api/excuses?page=${page}&size=${size}`),

  getExcuse: (excuseId) =>
    apiClient.get(`/api/excuses/${excuseId}`),

  createExcuse: ({ situation, target, tone }) =>
    apiClient.post("/api/excuses", { situation, target, tone }),

  evolveExcuse: ({ excuseId, direction }) =>
    apiClient.post(`/api/excuses/${excuseId}/evolve`, { direction }),
};
