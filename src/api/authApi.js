import { apiClient } from "./client";

export const authApi = {
  signup: ({ email, password, nickname }) =>
    apiClient.post("/api/auth/signup", { email, password, nickname }),

  login: ({ email, password }) =>
    apiClient.post("/api/auth/login", { email, password }),
};
