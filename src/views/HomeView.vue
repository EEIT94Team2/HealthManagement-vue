<template>
    <div class="home">
        <div class="welcome-section">
            <h1>歡迎來到健康管理系統</h1>
            <p>在這裡，您可以管理您的健康生活</p>
        </div>

        <div class="features">
            <div class="feature-card">
                <h3>課程管理</h3>
                <p>瀏覽並報名參加各種健康課程</p>
                <router-link to="/courses" class="feature-link">查看課程</router-link>
            </div>

            <div class="feature-card">
                <h3>個人資料</h3>
                <p>管理您的個人資料和健康記錄</p>
                <router-link to="/profile" class="feature-link">前往設定</router-link>
            </div>

            <div class="feature-card">
                <h3>訂單記錄</h3>
                <p>查看您的課程訂單和付款記錄</p>
                <router-link to="/orders" class="feature-link">查看訂單</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
    if (!authStore.token) {
        router.push("/login");
    }
});
</script>

<style scoped>
.home {
    padding: 2rem;
}

.welcome-section {
    text-align: center;
    margin-bottom: 3rem;
}

.welcome-section h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 1rem;
}

.welcome-section p {
    font-size: 1.2rem;
    color: #666;
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 1rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.2s;
}

.feature-card:hover {
    transform: translateY(-4px);
}

.feature-card h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
}

.feature-card p {
    color: #666;
    margin-bottom: 1.5rem;
}

.feature-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #4caf50;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.feature-link:hover {
    background-color: #45a049;
}
</style>
