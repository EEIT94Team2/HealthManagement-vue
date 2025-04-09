<template>
    <div class="login-container">
        <div class="login-box">
            <h2>登入</h2>
            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label for="username">帳號</label>
                    <input
                        type="text"
                        id="username"
                        v-model="username"
                        required
                        placeholder="請輸入帳號"
                        :disabled="loading"
                    />
                </div>
                <div class="form-group">
                    <label for="password">密碼</label>
                    <input
                        type="password"
                        id="password"
                        v-model="password"
                        required
                        placeholder="請輸入密碼"
                        :disabled="loading"
                    />
                </div>
                <button type="submit" :disabled="loading">
                    {{ loading ? "登入中..." : "登入" }}
                </button>
            </form>
            <p v-if="error" class="error-message">{{ error }}</p>
            <p class="register-link">
                還沒有帳號？
                <router-link to="/register">立即註冊</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
    try {
        loading.value = true;
        error.value = "";

        await authStore.login({
            username: username.value,
            password: password.value,
        });

        // 如果有重定向地址，則跳轉到該地址
        const redirectPath = route.query.redirect || "/";
        router.push(redirectPath);
    } catch (err) {
        console.error("Login failed:", err);
        error.value = err.message || "登入失敗，請稍後再試";
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.login-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    font-weight: bold;
}

input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

button {
    padding: 0.75rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.error-message {
    color: #ff4444;
    margin-top: 1rem;
    text-align: center;
}

.register-link {
    margin-top: 1rem;
    text-align: center;
}

a {
    color: #4caf50;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>
