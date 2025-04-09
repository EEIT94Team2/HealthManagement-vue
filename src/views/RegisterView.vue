<template>
    <div class="register-container">
        <div class="register-box">
            <h2>註冊帳號</h2>
            <form @submit.prevent="handleRegister" class="register-form">
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
                <div class="form-group">
                    <label for="confirmPassword">確認密碼</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        v-model="confirmPassword"
                        required
                        placeholder="請再次輸入密碼"
                        :disabled="loading"
                    />
                </div>
                <div class="form-group">
                    <label for="email">電子郵件</label>
                    <input
                        type="email"
                        id="email"
                        v-model="email"
                        required
                        placeholder="請輸入電子郵件"
                        :disabled="loading"
                    />
                </div>
                <button type="submit" :disabled="loading || !isFormValid">
                    {{ loading ? "註冊中..." : "註冊" }}
                </button>
            </form>
            <p v-if="error" class="error-message">{{ error }}</p>
            <p class="login-link">
                已有帳號？
                <router-link to="/login">立即登入</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const email = ref("");
const loading = ref(false);
const error = ref("");

const isFormValid = computed(() => {
    return (
        username.value.length >= 4 &&
        password.value.length >= 6 &&
        password.value === confirmPassword.value &&
        email.value.includes("@")
    );
});

async function handleRegister() {
    if (!isFormValid.value) {
        error.value = "請確認所有欄位填寫正確";
        return;
    }

    try {
        loading.value = true;
        error.value = "";

        await authStore.register({
            username: username.value,
            password: password.value,
            email: email.value,
        });

        router.push("/login");
    } catch (err) {
        console.error("Register failed:", err);
        error.value = err.message || "註冊失敗，請稍後再試";
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.register-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.register-form {
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

.login-link {
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
