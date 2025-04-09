<template>
    <div id="app">
        <nav v-if="isLoggedIn" class="navbar">
            <router-link to="/" class="nav-link">首頁</router-link>
            <router-link to="/courses" class="nav-link">課程</router-link>
            <a @click="handleLogout" class="nav-link logout">登出</a>
        </nav>
        <router-view></router-view>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isLoggedIn = computed(() => !!authStore.token);

const handleLogout = () => {
    authStore.logout();
    router.push("/login");
};
</script>

<style>
#app {
    font-family: Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    min-height: 100vh;
}

.navbar {
    background-color: #4caf50;
    padding: 1rem 2rem;
    display: flex;
    gap: 1rem;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.logout {
    margin-left: auto;
    cursor: pointer;
}

body {
    margin: 0;
    padding: 0;
}
</style>
