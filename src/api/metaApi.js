import { apiClient } from "./client";

export const metaApi = {
  getMeta: () => apiClient.get("/api/meta"),
};
