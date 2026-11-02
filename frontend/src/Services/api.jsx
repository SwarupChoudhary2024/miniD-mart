import axios from "axios";

// Backend address. Change it in frontend/.env (VITE_API_URL=...) - see .env.example
const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8081/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const isAuthRequest = (config) =>
    typeof config?.url === "string" && config.url.startsWith("/auth/");

// ------------------------------------------------------------------
// Attach the JWT token to every request (except login / register)
// ------------------------------------------------------------------
api.interceptors.request.use(
    (config) => {
        if (!isAuthRequest(config)) {
            const token = localStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ------------------------------------------------------------------
// Token expired / invalid -> clear the session and go to the login page
// ------------------------------------------------------------------
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (
            status === 401 &&
            !isAuthRequest(error.config) &&
            localStorage.getItem("token")
        ) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("role");

            window.dispatchEvent(new Event("authChange"));

            if (window.location.pathname !== "/login") {
                window.location.assign("/login");
            }
        }

        return Promise.reject(error);
    }
);

// ------------------------------------------------------------------
// Turn any axios error into a readable message for the user
// ------------------------------------------------------------------
export const getErrorMessage = (
    error,
    fallback = "Something went wrong. Please try again."
) => {
    if (error?.response) {
        const data = error.response.data;

        if (typeof data === "string" && data.trim()) {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (data?.error) {
            return data.error;
        }

        return fallback;
    }

    if (error?.request) {
        return "Cannot reach the server. Please check that the backend is running.";
    }

    return error?.message || fallback;
};

export default api;
