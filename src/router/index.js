import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
            meta: { requiresAuth: true },
        },
        {
            path: "/login",
            name: "login",
            component: () => import("../views/LoginView.vue"),
        },
        {
            path: "/register",
            name: "register",
            component: () => import("../views/RegisterView.vue"),
        },
        {
            path: "/courses",
            name: "courses",
            component: () => import("../views/CourseListView.vue"),
            meta: { requiresAuth: true },
        },
        {
            path: "/courses/:id",
            name: "course-detail",
            component: () => import("../views/CourseDetailView.vue"),
            meta: { requiresAuth: true },
        },
        {
            path: "/profile",
            name: "profile",
            component: () => import("../views/ProfileView.vue"),
            meta: { requiresAuth: true },
        },
        {
            path: "/orders",
            name: "orders",
            component: () => import("../views/OrderListView.vue"),
            meta: { requiresAuth: true },
        },
    ],
});

// 導航守衛
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.token) {
        // 需要登錄但未登錄，重定向到登錄頁
        next({ name: "login", query: { redirect: to.fullPath } });
    } else if ((to.name === "login" || to.name === "register") && authStore.token) {
        // 已登錄用戶訪問登錄或註冊頁，重定向到首頁
        next({ name: "home" });
    } else {
        next();
    }
});

export default router;
