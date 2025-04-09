import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

// 創建 axios 實例
const instance = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 請求攔截器
instance.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        const token = authStore.token;

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

// 響應攔截器
instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error("Response error:", error);

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 未授權，清除 token 並跳轉到登錄頁面
                    const authStore = useAuthStore();
                    authStore.logout();
                    router.push("/login");
                    break;
                case 403:
                    // 無權限
                    router.push("/403");
                    break;
                case 500:
                    // 服務器錯誤
                    console.error("Server Error:", error.response.data);
                    break;
            }
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default instance;
