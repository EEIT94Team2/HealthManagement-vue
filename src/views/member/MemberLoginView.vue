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
        <el-button type="primary" @click="login" :loading="isLoading"
          >登入</el-button
        >
      </el-form-item>
      <p v-if="loginError" style="color: red">{{ loginError }}</p>
    </el-form>
    <p>還沒有帳號？<router-link to="/member/register">立即註冊</router-link></p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const loginForm = ref({
  email: "",
  password: "",
});
const loginError = ref("");
const isLoading = ref(false);

const login = async () => {
  loginError.value = "";
  isLoading.value = true;

  try {
    // 使用auth store進行登入
    const result = await authStore.login(loginForm.value);

    if (result.success) {
      ElMessage.success("登入成功！");
      // 登入成功後導向到首頁
      router.push("/dashboard");
    } else {
      loginError.value = result.message || "登入失敗，請稍後再試";
    }
  } catch (error) {
    console.error("登入失敗", error);
    loginError.value = "無法連接到伺服器，請檢查網絡連接。";
  } finally {
    isLoading.value = false;
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
