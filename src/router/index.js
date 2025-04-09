import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/components/Layouts/index.vue';
import HomePage from '@/views/HomePage.vue';
import CourseList from '@/views/course/CourseList.vue';
import CourseForm from '@/views/course/CourseForm.vue';

// 會員中心
import MemberLoginView from '@/views/member/MemberLoginView.vue';
import MemberRegisterView from '@/views/member/MemberRegisterView.vue';
import MemberProfileView from '@/views/member/MemberProfileView.vue';

// 購物車
import CartOrdersView from '@/views/shop/CartOrdersView.vue';
import CartAddProductView from '@/views/shop/CartAddProductView.vue';

// 論壇
import ForumHomeView from '@/views/social/ForumHomeView.vue';
import ForumPostsView from '@/views/social/ForumPostsView.vue';
import ForumCreateView from '@/views/social/ForumCreateView.vue';

// 追蹤成效
import TrackingOverviewView from '@/views/fitness/TrackingOverviewView.vue';
import TrackingReportsView from '@/views/fitness/TrackingReportsView.vue';
import TrackingGoalsView from '@/views/fitness/TrackingGoalsView.vue';

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: HomePage,
        meta: { title: '首頁', icon: 'HomeFilled', requiresAuth: true }, // 需要登入
      },
      {
        path: 'courses',
        name: 'CourseList',
        component: CourseList,
        meta: { title: '課程管理', icon: 'Calendar', requiresAuth: true }, // 需要登入
      },
      {
        path: 'courses/create',
        name: 'CourseCreate',
        component: CourseForm,
        meta: { title: '創建課程', hidden: true, requiresAuth: true }, // 需要登入
      },
      {
        path: 'courses/edit/:id',
        name: 'CourseEdit',
        component: CourseForm,
        meta: { title: '編輯課程', hidden: true, requiresAuth: true }, // 需要登入
      },
      {
        path: 'member/login',
        name: 'MemberLogin',
        component: MemberLoginView,
        meta: { title: '會員登入' }, // 不需要登入
      },
      {
        path: 'member/register',
        name: 'MemberRegister',
        component: MemberRegisterView,
        meta: { title: '會員註冊' }, // 不需要登入
      },
      {
        path: 'member/profile',
        name: 'MemberProfile',
        component: MemberProfileView,
        meta: { title: '會員資料', requiresAuth: true }, // 需要登入
      },
      {
        path: 'shop/orders',
        name: 'CartOrders',
        component: CartOrdersView,
        meta: { title: '訂單管理', requiresAuth: true }, // 需要登入
      },
      {
        path: 'shop/add-product',
        name: 'CartAddProduct',
        component: CartAddProductView,
        meta: { title: '新增商品', requiresAuth: true }, // 需要登入
      },
      {
        path: 'social/home',
        name: 'ForumHome',
        component: ForumHomeView,
        meta: { title: '論壇首頁', requiresAuth: true }, // 需要登入
      },
      {
        path: 'social/posts',
        name: 'ForumPosts',
        component: ForumPostsView,
        meta: { title: '文章列表', requiresAuth: true }, // 需要登入
      },
      {
        path: 'social/create',
        name: 'ForumCreate',
        component: ForumCreateView,
        meta: { title: '發表文章', requiresAuth: true }, // 需要登入
      },
      {
        path: 'fitness/overview',
        name: 'TrackingOverview',
        component: TrackingOverviewView,
        meta: { title: '成效總覽', requiresAuth: true }, // 需要登入
      },
      {
        path: 'fitness/reports',
        name: 'TrackingReports',
        component: TrackingReportsView,
        meta: { title: '報表分析', requiresAuth: true }, // 需要登入
      },
      {
        path: 'fitness/goals',
        name: 'TrackingGoals',
        component: TrackingGoalsView,
        meta: { title: '目標設定', requiresAuth: true }, // 需要登入
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// router.beforeEach((to, from, next) => {
//   if (to.meta.requiresAuth) {
//     const authToken = localStorage.getItem('authToken');
//     if (!authToken) {
//       // 如果需要授權且沒有 token，則導向登入頁面
//       next('/member/login');
//     } else {
//       // 如果有 token，則繼續導航
//       next();
//     }
//   } else {
//     // 如果不需要授權，則繼續導航
//     next();
//   }
// });

export default router;