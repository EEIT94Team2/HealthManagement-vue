<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <img v-if="logo" :src="logo" class="logo-image" alt="Logo" />
      <span class="logo-text">{{ title }}</span>
    </div>
    <el-menu
      router
      default-active="$route.path"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      :collapse="isCollapse"
      @select="handleSelect"
    >
      <el-menu-item index="/dashboard">
        <el-icon><HomeFilled /></el-icon>
        <span>首頁</span>
      </el-menu-item>

      <el-sub-menu index="member">
        <template #title>
          <el-icon><user /></el-icon>
          <span>會員中心</span>
        </template>
        <el-menu-item index="/member/register">
          <span>會員註冊</span>
        </el-menu-item>
        <el-menu-item index="/member/profile">
          <span>會員資料</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="courses">
        <template #title>
          <el-icon><Calendar /></el-icon>
          <span>課程管理</span>
        </template>
        <el-menu-item index="/courses">
          <span>課程列表</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="shop">
        <template #title>
          <el-icon><ShoppingCart /></el-icon>
          <span>商城管理</span>
        </template>

        <el-menu-item index="/shop/products">
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/shop/cart">
          <span>購物車管理</span>
        </el-menu-item>
        <el-menu-item index="/shop/orders">
          <span>訂單管理</span>
        </el-menu-item>
        <el-menu-item index="/shop/payment-simulation">
          <span>模擬支付</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="fitness">
        <template #title>
          <el-icon><Histogram /></el-icon>
          <span>追蹤成效</span>
        </template>
        <el-menu-item index="/fitness/admin/workouts">
          <span>運動紀錄管理</span>
        </el-menu-item>
        <!-- <el-menu-item index="/fitness/admin/diet">
          <span>飲食紀錄管理</span>
        </el-menu-item> -->
        <el-menu-item index="/fitness/admin/body">
          <span>身體數據管理</span>
        </el-menu-item>
        <!-- <el-menu-item index="/fitness/admin/goals">
          <span>目標與進度</span>
        </el-menu-item> -->
        <el-menu-item index="/fitness/admin/reports">
          <span>報告與數據分析</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="social">
        <template #title>
          <el-icon><ChatSquare /></el-icon>
          <span>論壇</span>
        </template>
        <el-menu-item index="/social/home">
          <span>論壇首頁</span>
        </el-menu-item>
        <el-menu-item index="/social/posts">
          <span>文章列表</span>
        </el-menu-item>
        <el-menu-item index="/social/create">
          <span>發表文章</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, defineEmits, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  HomeFilled,
  Calendar,
  User,
  ShoppingCart,
  ChatSquare,
  Histogram,
} from "@element-plus/icons-vue";
import logoImage from "@/assets/images/logo.png"; // 假設你的 logo 在這裡

const router = useRouter();
const route = useRoute();
const isCollapse = ref(false);
const emit = defineEmits(["update-title"]); // 定義發射的事件
const logo = ref(logoImage);
const title = ref("你今天健了嗎");

const handleSelect = (index, indexPath) => {
  let title = "後端管理系統"; // 預設標題
  switch (index) {
    case "/dashboard":
      title = "首頁";
      break;
    case "/member/login":
      title = "會員登入";
      break;
    case "/member/register":
      title = "會員註冊";
      break;
    case "/member/profile":
      title = "會員資料";
      break;
    case "/courses":
      title = "課程列表";
      break;
    case "/shop/orders":
      title = "訂單管理";
      break;
    case "/shop/cart":
      title = "購物車管理";
      break;
    case "/shop/products":
      title = "商品管理";
      break;
    case "/shop/payment-simulation":
      title = "模擬支付";
      break;
    case "/fitness/admin/workouts":
      title = "運動紀錄管理";
      break;
    case "/fitness/admin/diet":
      title = "飲食紀錄管理";
      break;
    case "/fitness/admin/body":
      title = "身體數據管理";
      break;
    case "/social/home":
      title = "論壇首頁";
      break;
    case "/social/posts":
      title = "文章列表";
      break;
    case "/social/create":
      title = "發表文章";
      break;
    default:
      title = "後端管理系統";
      break;
  }
  emit("update-title", title);
};
</script>

<style lang="scss" scoped>
.sidebar {
  width: 200px;
  height: 100%;
  background-color: #304156;
  color: #bfcbd9;
  overflow-y: auto;
  display: flex;
  flex-direction: column; /* 垂直排列，方便 header 放在頂部 */
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center; /* 水平居中 */
  padding: 15px 10px;
}

.logo-image {
  height: 30px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #bfcbd9; /* 與側邊欄文字顏色一致 */
}

.el-menu {
  border-right: none;
  flex-grow: 1; /* 讓 el-menu 佔據剩餘空間 */
}
</style>
