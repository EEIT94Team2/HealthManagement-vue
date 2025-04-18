import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";
import Layout from "@/components/Layouts/index.vue";
import HomePage from "@/views/HomePage.vue";
import CourseList from "@/views/course/CourseList.vue";
import CourseForm from "@/views/course/CourseForm.vue";

// 會員中心
import MemberLoginView from "@/views/member/MemberLoginView.vue";
import MemberRegisterView from "@/views/member/MemberRegisterView.vue";
import MemberProfileView from "@/views/member/MemberProfileView.vue";
import MemberManagement from "@/views/member/MemberManagement.vue";

// 商城管理
import OrderList from "@/views/shop/OrderList.vue";
import OrderDetail from "@/views/shop/OrderDetail.vue";
import CartManagement from "@/views/shop/CartManagement.vue";
import ProductList from "@/views/shop/ProductList.vue";
import ProductDetail from "@/views/shop/ProductDetail.vue";
import ProductManagement from "@/views/shop/ProductManagement.vue";
import ProductAdmin from "@/views/shop/ProductAdmin.vue";
import PaymentSimulation from "@/views/shop/PaymentSimulation.vue";

// 論壇
import ForumHomeView from "@/views/social/ForumHomeView.vue";
import ForumPostsView from "@/views/social/ForumPostsView.vue";
import ForumCreateView from "@/views/social/ForumCreateView.vue";

// 追蹤成效
import AdminDietRecords from "@/views/fitness/backend/DietRecords.vue";
import AdminExerciseRecords from "@/views/fitness/backend/ExerciseRecords.vue";
import AdminBodyData from "@/views/fitness/backend/BodyData.vue";
import AdminGoalsProgress from "@/views/fitness/backend/GoalsProgress.vue";
import ReportsAnalysis from "@/views/fitness/backend/ReportsAnalysis.vue";

// 錯誤頁面
import Forbidden403 from "@/views/403.vue";

const routes = [
    {
        path: "/",
        component: Layout,
        redirect: "/member/login",
        children: [
            {
                path: "dashboard",
                name: "Dashboard",
                component: HomePage,
                meta: { title: "首頁", icon: "HomeFilled", requiresAuth: true },
            },
            {
                path: "courses",
                name: "CourseList",
                component: CourseList,
                meta: { title: "課程管理", icon: "Calendar", requiresAuth: true },
            },
            {
                path: "courses/create",
                name: "CourseCreate",
                component: CourseForm,
                meta: { title: "創建課程", hidden: true, requiresAuth: true },
            },
            {
                path: "courses/edit/:id",
                name: "CourseEdit",
                component: CourseForm,
                meta: { title: "編輯課程", hidden: true, requiresAuth: true },
            },

            // 會員中心
            {
                path: "member/login",
                name: "MemberLogin",
                component: MemberLoginView,
                meta: { title: "會員登入" },
            },
            {
                path: "member/register",
                name: "MemberRegister",
                component: MemberRegisterView,
                meta: { title: "會員註冊" },
            },
            {
                path: "member/profile",
                name: "MemberProfile",
                component: MemberProfileView,
                meta: { title: "會員資料", requiresAuth: true },
            },
            {
                path: "member/management",
                name: "MemberManagement",
                component: MemberManagement,
                meta: { title: "會員總管", requiresAuth: true, requiresAdmin: true },
            },
            // 商城管理
            {
                path: "shop/orders",
                name: "OrderList",
                component: OrderList,
                meta: { title: "訂單管理", requiresAuth: true },
            },
            {
                path: "shop/orders/:id",
                name: "OrderDetail",
                component: OrderDetail,
                meta: { title: "訂單詳情", requiresAuth: true },
            },

            {
                path: "shop/products",
                name: "ProductList",
                component: ProductList,
                meta: { title: "商品管理", requiresAuth: true },
            },
            { path: "shop/product-list", redirect: "/shop/products" },
            {
                path: "shop/products/:id",
                name: "ProductDetail",
                component: ProductDetail,
                meta: { title: "商品詳情", requiresAuth: true },
            },
            {
                path: "shop/product-management",
                name: "ProductManagement",
                component: ProductManagement,
                meta: { title: "商品管理", requiresAuth: true, requiresAdmin: true },
            },
            {
                path: "shop/product-admin",
                name: "ProductAdmin",
                component: ProductAdmin,
                meta: { title: "商品管理後台", requiresAuth: true, requiresAdmin: true },
            },
            {
                path: "shop/cart",
                name: "CartManagement",
                component: CartManagement,
                meta: { title: "購物車管理", requiresAuth: true },
            },

            {
                path: "shop/checkout",
                name: "PaymentSimulation",
                component: PaymentSimulation,
                meta: { title: "模擬支付", requiresAuth: true },
            },

            // 論壇
            {
                path: "social/home",
                name: "ForumHome",
                component: ForumHomeView,
                meta: { title: "論壇首頁", requiresAuth: true },
            },
            {
                path: "social/posts",
                name: "ForumPosts",
                component: ForumPostsView,
                meta: { title: "文章列表", requiresAuth: true },
            },
            {
                path: "social/create",
                name: "ForumCreate",
                component: ForumCreateView,
                meta: { title: "發表文章", requiresAuth: true },
            },

            {
                path: "fitness/admin/workouts",
                name: "AdminWorkouts",
                component: AdminExerciseRecords,
                meta: {
                    title: "運動紀錄管理",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            {
                path: "fitness/admin/diet",
                name: "AdminDiet",
                component: AdminDietRecords,
                meta: {
                    title: "飲食紀錄管理",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            {
                path: "fitness/admin/body",
                name: "AdminBodyData",
                component: AdminBodyData,
                meta: {
                    title: "身體數據管理",
                    icon: "Scale",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            {
                path: "fitness/admin/goals",
                name: "AdminGoalsProgress",
                component: AdminGoalsProgress,
                meta: {
                    title: "目標與進度",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            {
                path: "fitness/admin/reports",
                name: "ReportsAnalysis",
                component: ReportsAnalysis,
                meta: {
                    title: "報告與數據分析",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },

            // 錯誤頁面
            {
                path: "error/403",
                name: "Forbidden",
                component: Forbidden403,
                meta: { title: "訪問被拒絕" },
            },
        ],
    },
    // 全局錯誤頁面，不使用布局
    {
        path: "/error/403",
        name: "GlobalForbidden",
        component: Forbidden403,
        meta: { title: "訪問被拒絕" },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const authToken = localStorage.getItem("authToken");
        const userRole = localStorage.getItem("userRole");

        if (!authToken) {
            return next({
                path: "/member/login",
                query: { redirect: to.fullPath },
            });
        }

        if (to.meta.requiresAdmin && userRole !== "admin") {
            ElMessage.error("您沒有訪問此頁面的權限");
            return next({
                path: "/error/403",
                query: { 
                    message: "您沒有管理員權限，無法訪問此頁面", 
                    code: "ERR_BAD_REQUEST" 
                }
            });
        }

        if (to.meta.isAdmin && userRole !== "admin") {
            ElMessage.error("您沒有管理員權限");
            return next({
                path: "/error/403",
                query: { 
                    message: "您沒有管理員權限，無法訪問此頁面", 
                    code: "ERR_BAD_REQUEST" 
                }
            });
        }

        return next();
    }

    return next();
});

export default router;
