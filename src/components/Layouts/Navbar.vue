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
        <el-avatar :size="30" :src="userAvatarUrl" :icon="UserFilled" />
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus';
import { UserFilled, SwitchButton } from '@element-plus/icons-vue';

const router = useRouter();

const props = defineProps({
  title: {
    type: String,
    default: '後端管理系統',
  },
});

const loggedInAccount = ref('admin');
const loggedInNickname = ref('哈囉');
const userAvatarUrl = ref('');

const logout = () => {
  console.log('登出');
  localStorage.removeItem('authToken');
  router.push('/login');
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;

  .user-info {
    display: flex;
    align-items: center;

    .el-dropdown {
      margin-left: 15px;
    }

    .el-avatar {
      cursor: pointer;
    }
  }
}
</style>
