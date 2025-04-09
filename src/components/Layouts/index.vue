<template>
  <div class="app-wrapper">
    <Sidebar @update-title="handleTitleUpdate" />
    <div class="main-container">
      <Navbar :title="navbarTitle" />
      <AppMain>
        <router-view />
      </AppMain>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue';
import Navbar from './Navbar.vue';
import AppMain from './AppMain.vue';
import { ref } from 'vue';

const navbarTitle = ref('後端管理系統'); // 初始標題

const handleTitleUpdate = (title) => {
  navbarTitle.value = title;
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
}

.main-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>