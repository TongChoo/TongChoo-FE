import { apiClient } from "./client";

export const metaApi = {
  getMeta: () => apiClient.get("/api/meta", { cacheTtlMs: 60 * 60 * 1_000 }),
};
