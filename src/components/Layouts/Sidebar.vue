<template>
  <div class="sidebar">
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
        <el-menu-item index="/member/login">
          <span>會員登入</span>
        </el-menu-item>
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
          <span>購物車</span>
        </template>
        <el-menu-item index="/shop/orders">
          <span>訂單管理</span>
        </el-menu-item>
        <el-menu-item index="/shop/add-product">
          <span>新增商品</span>
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
        <el-menu-item index="/fitness/admin/diet">
          <span>飲食紀錄管理</span>
        </el-menu-item>
        <el-menu-item index="/fitness/admin/body">
          <span>身體數據管理</span>
        </el-menu-item>
        <el-menu-item index="/fitness/admin/goals">
          <span>目標與進度</span>
        </el-menu-item>
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

const router = useRouter();
const route = useRoute();
const isCollapse = ref(false);
const emit = defineEmits(["update-title"]); // 定義發射的事件

// 假設你將管理員狀態儲存在 localStorage 中
const isAdmin = computed(() => localStorage.getItem("isAdmin") === "true");

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
    case "/shop/add-product":
      title = "新增商品";
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
    case "/fitness/admin/goals-progress":
      title = "目標與進度";
      break;
    case "/fitness/admin/reports":
      title = "報告與數據分析";
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
    case "member":
    case "courses":
    case "shop":
    case "fitness":
    case "social":
      title = indexPath.slice(-1)[0];
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
}
.el-menu {
  border-right: none;
}
</style>
