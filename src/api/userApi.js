import { apiClient } from "./client";

export const userApi = {
  getMyRank: () => apiClient.get("/api/users/me/rank"),
};
