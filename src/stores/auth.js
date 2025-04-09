import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "@/api/config/axios";

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem("token") || "");
    const user = ref(JSON.parse(localStorage.getItem("user") || "{}"));

    function setToken(newToken) {
        token.value = newToken;
        localStorage.setItem("token", newToken);
    }

    function setUser(newUser) {
        user.value = newUser;
        localStorage.setItem("user", JSON.stringify(newUser));
    }

    async function login(credentials) {
        try {
            const response = await axios.post("/auth/login", credentials);
            setToken(response.token);
            setUser(response.user);
            return response;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    async function register(userData) {
        try {
            const response = await axios.post("/auth/register", userData);
            setToken(response.token);
            setUser(response.user);
            return response;
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    }

    function logout() {
        setToken("");
        setUser({});
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    return {
        token,
        user,
        login,
        register,
        logout,
    };
});
