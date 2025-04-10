<template>
  <div class="member-login-view">
    <h1>會員登入</h1>
    <el-form :model="loginForm" label-width="80px">
      <el-form-item label="電子郵件">
        <el-input v-model="loginForm.email" />
      </el-form-item>
      <el-form-item label="密碼">
        <el-input type="password" v-model="loginForm.password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登入</el-button>
      </el-form-item>
      <p v-if="loginError" style="color: red;">{{ loginError }}</p>
    </el-form>
    <p>還沒有帳號？<router-link to="/member/register">立即註冊</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loginForm = ref({
  email: '',
  password: '',
});
const loginError = ref('');

const login = async () => {
  loginError.value = '';
  try {
    // 連接後端登入API
    const response = await axios.post('/api/auth/login', loginForm.value);
    
    // 確保後端返回的格式符合預期
    if (response.data && response.data.success) {
      const { token, role } = response.data.data;

      // 將token存儲到localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);

      // 將token添加到axios的默認請求頭中
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      ElMessage.success('登入成功！');
      // 登入成功後導向到首頁
      router.push('/dashboard');
    } else {
      loginError.value = response.data.message || '登入失敗，請稍後再試';
    }
  } catch (error) {
    console.error('登入失敗', error);
    if (error.response && error.response.data) {
      loginError.value = error.response.data.message || '電子郵件或密碼錯誤，請重新輸入。';
    } else {
      loginError.value = '無法連接到伺服器，請檢查網絡連接。';
    }
  }
};
</script>

<style scoped>
.member-login-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: #f0f2f5;
}
h1 {
  margin-bottom: 20px;
}
.el-form {
  width: 300px;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>