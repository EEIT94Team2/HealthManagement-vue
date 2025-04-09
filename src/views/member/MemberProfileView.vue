<template>
  <div class="member-profile-view">
    <h1>會員資料</h1>
    <div v-if="loading">載入中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="user">
      <el-form :model="formData" label-width="120px">
        <el-form-item label="使用者 ID">
          <span>{{ user.userId }}</span>
        </el-form-item>
        <el-form-item label="使用者名稱">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="電子郵件">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="性別">
          <el-radio-group v-model="formData.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="個人簡介">
          <el-input type="textarea" v-model="formData.bio" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateProfile">更新資料</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const user = ref(null);
const loading = ref(false);
const error = ref(null);
const formData = ref({});

const getToken = () => localStorage.getItem('authToken');

const fetchProfile = async () => {
  loading.value = true;
  error.value = null;
  const token = getToken();
  if (!token) {
    error.value = '未找到登入憑證，請先登入。';
    loading.value = false;
    return;
  }

  try {
    // 假設後端需要使用者 ID 來獲取個人資料，這裡從 localStorage 中獲取 (可能在登入時儲存)
    const userId = JSON.parse(atob(token.split('.')[1])).sub; // 嘗試從 JWT 解碼獲取 userId
    const response = await axios.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    user.value = response.data.data;
    formData.value = { ...user.value };
  } catch (err) {
    console.error('獲取個人資料失敗', err);
    error.value = '無法獲取個人資料，請稍後重試。';
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  loading.value = true;
  error.value = null;
  const token = getToken();
  if (!token) {
    error.value = '未找到登入憑證，無法更新資料。';
    loading.value = false;
    return;
  }

  try {
    const userId = user.value.userId;
    const response = await axios.put(`/users/${userId}`, formData.value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    user.value = response.data.data;
    ElMessage.success('個人資料更新成功！');
  } catch (err) {
    console.error('更新個人資料失敗', err);
    error.value = '更新個人資料失敗，請檢查輸入或稍後重試。';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.member-profile-view {
  padding: 20px;
}
h1 {
  margin-bottom: 20px;
}
.el-form {
  max-width: 500px;
}
</style>