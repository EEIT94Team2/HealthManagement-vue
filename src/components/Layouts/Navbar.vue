<template>
    <div class="navbar">
        <h2>{{ title }}</h2>
        <div class="user-info">
            <el-dropdown trigger="click">
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
                            <el-icon><UserFilled /></el-icon>
                            <span>使用者：{{ loggedInAccount }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <el-icon><UserFilled /></el-icon>
                            <span>暱稱：{{ loggedInNickname }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="logout">
                            <el-icon><SwitchButton /></el-icon>
                            <span>登出</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
                <!-- 添加自定义类名 -->
                <el-avatar :src="userAvatarUrl" :icon="UserFilled" class="user-avatar" />
            </el-dropdown>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { useRouter } from "vue-router";
import { ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from "element-plus";
import { UserFilled, SwitchButton } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";

// 导入图片
import userAvatarImg from "@/assets/images/user.jpg";

const router = useRouter();
const authStore = useAuthStore();

const props = defineProps({
    title: {
        type: String,
        default: "後端管理系統",
    },
});

const loggedInAccount = ref("admin");
const loggedInNickname = ref("哈囉");
const userAvatarUrl = ref(userAvatarImg); // 将导入的图片路径赋给变量

// 使用auth store的登出方法
const logout = () => {
    console.log("登出");
    authStore.logout();
    // 注意：authStore.logout方法已經包含了重定向到/member/login
};
</script>

<style lang="scss" scoped>
.navbar {
    height: 60px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center; /* 🔥 垂直置中關鍵 */
    padding: 0 20px;
    justify-content: space-between;

    > * {
        display: flex;
        align-items: center;
        height: 100%; // 確保和 navbar 一樣高
    }

    h2 {
        margin: 0;
    }

    .user-info {
        .el-dropdown {
            margin-left: 15px;
        }

        .user-avatar {
            width: 50px;
            height: 50px;
        }
    }
}
</style>
