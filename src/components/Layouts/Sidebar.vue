<template>
  <div class="sidebar">
    <el-menu
      router
      default-active="$route.path"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      :collapse="isCollapse"
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
import { ref } from 'vue';
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