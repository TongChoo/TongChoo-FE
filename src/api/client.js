import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// Frontend.md §3.1: 이 경로들만 인증 헤더 없이 호출 가능
const PUBLIC_PATHS = ["/api/auth/signup", "/api/auth/login", "/api/meta"];

function isPublicPath(path) {
    return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
}

function clearAuthAndRedirectToLogin() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("nickname");
    localStorage.removeItem("expiresAt");

    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
}

const httpClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// StrictMode는 개발 중 부작용을 찾기 위해 effect를 한 번 더 실행한다. 같은 GET이
// 동시에 들어오면 하나의 Promise를 공유하고, 개발 모드에서는 아주 짧게 결과도 재사용한다.
const inFlightGets = new Map();
const getResponseCache = new Map();

function getCacheKey(path, config) {
    return JSON.stringify({
        path,
        params: config.params ?? null,
        token: localStorage.getItem("accessToken") ?? null,
    });
}

// Frontend.md §3.1: 공개 경로를 제외한 모든 요청에 Authorization 헤더를 자동으로 붙인다
httpClient.interceptors.request.use((config) => {
    if (isPublicPath(config.url)) return config;

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        const tokenType = localStorage.getItem("tokenType") ?? "Bearer";
        config.headers.Authorization = `${tokenType} ${accessToken}`;
    }

    return config;
});

// ApiResponse({status, message, data})에서 data만 꺼내 반환하고, 실패 시 message를 담아 throw한다.
// 페이지네이션 응답(PageResponse)도 data 그대로 반환되므로 별도 처리가 필요 없다.
httpClient.interceptors.response.use(
    (response) => response.data?.data,
    (error) => {
        const status = error.response?.status;
        const path = error.config?.url ?? "";

        if (status === 401 && !isPublicPath(path)) {
            clearAuthAndRedirectToLogin();
        }

        const message =
            error.response?.data?.message ??
            "요청 처리 중 오류가 발생했습니다.";
        const normalizedError = new Error(message);
        normalizedError.status = status;
        normalizedError.data = error.response?.data?.data;
        return Promise.reject(normalizedError);
    }
);

export const apiClient = {
    get: (path, config = {}) => {
        const {
            cacheTtlMs = import.meta.env.DEV ? 1_000 : 0,
            ...axiosConfig
        } = config;
        const cacheKey = getCacheKey(path, axiosConfig);
        const cached = getResponseCache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
            return Promise.resolve(cached.data);
        }
        if (cached) getResponseCache.delete(cacheKey);
        if (inFlightGets.has(cacheKey)) return inFlightGets.get(cacheKey);

        const request = httpClient.get(path, axiosConfig)
            .then((data) => {
                if (cacheTtlMs > 0) {
                    getResponseCache.set(cacheKey, {
                        data,
                        expiresAt: Date.now() + cacheTtlMs,
                    });
                }
                return data;
            })
            .finally(() => {
                if (inFlightGets.get(cacheKey) === request) {
                    inFlightGets.delete(cacheKey);
                }
            });

        inFlightGets.set(cacheKey, request);
        return request;
    },
    post: (path, body, config) => httpClient.post(path, body, config),
    patch: (path, body, config) => httpClient.patch(path, body, config),
};
