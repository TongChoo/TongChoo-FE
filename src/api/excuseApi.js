import { apiClient } from "./client";

export const excuseApi = {
  createExcuse: ({ situation, target, tone }) =>
    apiClient.post("/api/excuses", { situation, target, tone }),
};
