<template>
    <el-menu
        :default-active="activeIndex"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @select="handleSelect"
        :router="true"
    >
        <el-menu-item index="/dashboard" class="menu-item">
            <el-icon><HomeFilled /></el-icon>
            <span>首頁</span>
        </el-menu-item>

        <!-- 個人資料 -->
        <el-sub-menu index="/profile" class="menu-item">
            <template #title>
                <el-icon><User /></el-icon>
                <span>個人資料</span>
            </template>
            <el-menu-item index="/profile/view" class="submenu-item">
                <el-icon><Document /></el-icon>
                <span>查看個人資料</span>
            </el-menu-item>
            <el-menu-item index="/profile/edit" class="submenu-item">
                <el-icon><Edit /></el-icon>
                <span>編輯個人資料</span>
            </el-menu-item>
        </el-sub-menu>

        <!-- 課程管理 -->
        <el-sub-menu index="/course" class="menu-item">
            <template #title>
                <el-icon><Reading /></el-icon>
                <span>課程管理</span>
            </template>
            <el-menu-item index="/courses" class="submenu-item">
                <el-icon><List /></el-icon>
                <span>課程列表</span>
            </el-menu-item>
            <el-menu-item index="/courses/create" class="submenu-item">
                <el-icon><Management /></el-icon>
                <span>課程管理</span>
            </el-menu-item>
        </el-sub-menu>

        <!-- 購物模塊，修改順序 -->
        <el-sub-menu index="/shop" class="menu-item">
            <template #title>
                <el-icon><ShoppingCart /></el-icon>
                <span>購物模塊</span>
            </template>
            <!-- 順序: 商品管理、購物車管理、訂單管理、模擬支付 -->
            <el-menu-item index="/shop/products" class="submenu-item">
                <el-icon><Goods /></el-icon>
                <span>商品管理</span>
            </el-menu-item>
            <el-menu-item index="/shop/cart" class="submenu-item">
                <el-icon><ShoppingCartFull /></el-icon>
                <span>購物車管理</span>
            </el-menu-item>
            <el-menu-item index="/shop/orders" class="submenu-item">
                <el-icon><List /></el-icon>
                <span>訂單管理</span>
            </el-menu-item>
            <el-menu-item index="/shop/checkout" class="submenu-item">
                <el-icon><Money /></el-icon>
                <span>模擬支付</span>
            </el-menu-item>
        </el-sub-menu>

        <!-- 健康資料 -->
        <el-sub-menu index="/health" class="menu-item">
            <template #title>
                <el-icon><Monitor /></el-icon>
                <span>健康資料</span>
            </template>
            <el-menu-item index="/health/bmi" class="submenu-item">
                <el-icon><Histogram /></el-icon>
                <span>BMI計算</span>
            </el-menu-item>
            <el-menu-item index="/health/record" class="submenu-item">
                <el-icon><Notebook /></el-icon>
                <span>健康記錄</span>
            </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/setting" class="menu-item">
            <template #title>
                <el-icon><Setting /></el-icon>
                <span>系統設置</span>
            </template>
            <el-menu-item index="/setting/preference" class="submenu-item">
                <el-icon><Operation /></el-icon>
                <span>偏好設置</span>
            </el-menu-item>
            <el-menu-item index="/setting/notification" class="submenu-item">
                <el-icon><Bell /></el-icon>
                <span>通知設置</span>
            </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/member/login" class="menu-item">
            <el-icon><SwitchButton /></el-icon>
            <span>登出</span>
        </el-menu-item>
    </el-menu>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
    HomeFilled,
    User,
    Document,
    Edit,
    Reading,
    List,
    Management,
    ShoppingCart,
    ShoppingCartFull,
    Goods,
    Money,
    Monitor,
    Histogram,
    Notebook,
    Setting,
    Operation,
    Bell,
    SwitchButton,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const isCollapse = ref(false); // 是否折疊菜單
const activeIndex = computed(() => {
    return route.path;
});

// 處理菜單項選擇
const handleSelect = (index) => {
    console.log("選擇了菜單項：", index);
    if (index === "/logout") {
        // TODO: 實現登出功能
        console.log("用戶請求登出");
    }
};

onMounted(() => {
    console.log("當前路徑：", route.path);
});
</script>

<style scoped>
.el-menu-vertical-demo {
    min-height: 100vh;
    border-right: none;
}

.menu-item {
    text-align: left;
}

.submenu-item {
    text-align: left;
    padding-left: 15px;
}
</style>
