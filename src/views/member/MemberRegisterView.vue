<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();
const registerForm = ref({
  name: "",
  email: "",
  password: "",
  gender: "male",
  bio: "",
});
const registerError = ref("");

const register = async () => {
  registerError.value = "";
  try {
    // 修改 API 端點 URL 以匹配後端 @RequestMapping("/api/auth")
    await axios.post("/api/auth/register", registerForm.value);
    ElMessage.success("註冊成功！請前往登入。");
    router.push("/member/login");
  } catch (error) {
    console.error("註冊失敗", error);
    // 嘗試顯示後端返回的具體錯誤訊息
    if (error.response && error.response.data && error.response.data.message) {
      registerError.value = error.response.data.message;
    } else {
      registerError.value = "註冊失敗，請檢查您的輸入或稍後重試。";
    }
  }
};
</script>
