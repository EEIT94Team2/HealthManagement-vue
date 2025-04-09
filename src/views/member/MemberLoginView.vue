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
    const response = await axios.post('/auth/login', loginForm.value);
    const { token, role } = response.data.data;

    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);

    ElMessage.success('登入成功！');
    router.push('/dashboard');
  } catch (error) {
    console.error('登入失敗', error);
    loginError.value = '電子郵件或密碼錯誤，請重新輸入。';
  }
};
</script>

<style scoped>
.member-login-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
h1 {
  margin-bottom: 20px;
}
.el-form {
  width: 300px;
}
</style>