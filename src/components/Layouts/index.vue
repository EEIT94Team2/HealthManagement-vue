<template>
  <div class="app-wrapper">
    <Sidebar @update-title="handleTitleUpdate" />
    <div class="main-container">
      <Navbar :title="navbarTitle" />
      <AppMain>
        <router-view />
      </AppMain>
      <!-- Footer placed after main content -->
      <Footer />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue';
import Navbar from './Navbar.vue';
import AppMain from './AppMain.vue';
import Footer from './Footer.vue'; // Import Footer component
import { ref } from 'vue';

const navbarTitle = ref('後端管理系統'); // 初始標題

const handleTitleUpdate = (title) => {
  navbarTitle.value = title;
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.main-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* This ensures main container takes the remaining space */
  overflow-y: auto;
}

.footer {
  height: 30px;
  border-top: 1px solid #e9e9e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
}
</style>
