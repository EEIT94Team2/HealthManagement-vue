<!-- 主要佈局容器組件 -->

<template>
    <div class="app-wrapper">
      <Sidebar />
      <div class="main-container">
        <Navbar />
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