<template>
  <div class="member-register-view">
    <h1>會員註冊</h1>
    <el-form :model="registerForm" label-width="80px">
      <el-form-item label="姓名">
        <el-input v-model="registerForm.name" />
      </el-form-item>
      <el-form-item label="電子郵件">
        <el-input v-model="registerForm.email" />
      </el-form-item>
      <el-form-item label="密碼">
        <el-input type="password" v-model="registerForm.password" />
      </el-form-item>
      <el-form-item label="性別">
        <el-radio-group v-model="registerForm.gender">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
          <el-radio label="other">其他</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="個人簡介">
        <el-input type="textarea" v-model="registerForm.bio" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="register">註冊</el-button>
      </el-form-item>
      <p v-if="registerError" style="color: red;">{{ registerError }}</p>
    </el-form>
    <p>已經有帳號了？<router-link to="/member/login">立即登入</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const registerForm = ref({
  name: '',
  email: '',
  password: '',
  gender: 'male',
  bio: '',
});
const registerError = ref('');

const register = async () => {
  registerError.value = '';
  try {
    await axios.post('/auth/register', registerForm.value);
    ElMessage.success('註冊成功！請前往登入。');
    router.push('/member/login');
  } catch (error) {
    console.error('註冊失敗', error);
    registerError.value = '註冊失敗，請檢查您的輸入或稍後重試。';
  }
};
</script>

<style scoped>
.member-register-view {
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