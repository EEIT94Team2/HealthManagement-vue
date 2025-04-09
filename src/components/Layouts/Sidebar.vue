<template>
  <div class="sidebar">
    <el-menu
      router
      default-active="$route.path"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      :collapse="isCollapse"
      @select="handleSelect" >
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
        <el-menu-item index="/fitness/overview">
          <span>成效總覽</span>
        </el-menu-item>
        <el-menu-item index="/fitness/reports">
          <span>報表分析</span>
        </el-menu-item>
        <el-menu-item index="/fitness/goals">
          <span>目標設定</span>
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
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import {
  HomeFilled,
  Calendar,
  User,
  ShoppingCart,
  ChatSquare,
  Histogram,
} from '@element-plus/icons-vue';

const router = useRouter();
const isCollapse = ref(false);
const emit = defineEmits(['update-title']); // 定義發射的事件

const handleSelect = (index, indexPath) => {
  // 根據 index 或 indexPath 判斷點擊的選單項，並發射事件
  let title = '後端管理系統'; // 預設標題
  switch (index) {
    case '/dashboard':
      title = '首頁';
      break;
    case '/member/login':
      title = '會員登入';
      break;
    case '/member/register':
      title = '會員註冊';
      break;
    case '/member/profile':
      title = '會員資料';
      break;
    case '/courses':
      title = '課程列表';
      break;
    case '/shop/orders':
      title = '訂單管理';
      break;
    case '/shop/add-product':
      title = '新增商品';
      break;
    case '/fitness/overview':
      title = '成效總覽';
      break;
    case '/fitness/reports':
      title = '報表分析';
      break;
    case '/fitness/goals':
      title = '目標設定';
      break;
    case '/social/home':
      title = '論壇首頁';
      break;
    case '/social/posts':
      title = '文章列表';
      break;
    case '/social/create':
      title = '發表文章';
      break;
    case 'member': // 父選單，可以根據需求處理
    case 'courses':
    case 'shop':
    case 'fitness':
    case 'social':
      // 可以選擇不更新標題，或者根據父選單的文字更新
      title = indexPath.slice(-1)[0]; // 使用最後一個路徑片段作為標題
      break;
    default:
      title = '後端管理系統';
      break;
  }
  emit('update-title', title);
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