<template>
  <div>
    <h1>綜合數據報告</h1>
    <div>
      <div style="display: flex; flex-wrap: wrap; gap: 20px">
        <el-card style="width: 250px">
          <template #header>
            <div class="card-header">
              <span>總訓練次數</span>
            </div>
          </template>
          <div style="text-align: center; font-size: 24px; font-weight: bold">
            {{ dashboardStats.totalWorkouts }}
          </div>
        </el-card>

        <el-card style="width: 250px">
          <template #header>
            <div class="card-header">
              <span>總訓練時長 (分鐘)</span>
            </div>
          </template>
          <div style="text-align: center; font-size: 24px; font-weight: bold">
            {{ dashboardStats.totalWorkoutMinutes }}
          </div>
        </el-card>

        <el-card style="width: 250px">
          <template #header>
            <div class="card-header">
              <span>總燃燒卡路里</span>
            </div>
          </template>
          <div style="text-align: center; font-size: 24px; font-weight: bold">
            {{
              dashboardStats.totalCaloriesBurned
                ? dashboardStats.totalCaloriesBurned.toFixed(2)
                : 0
            }}
          </div>
        </el-card>

        <el-card style="width: 250px">
          <template #header>
            <div class="card-header">
              <span>本週活躍用戶數</span>
            </div>
          </template>
          <div style="text-align: center; font-size: 24px; font-weight: bold">
            {{ dashboardStats.activeUsersThisWeek }}
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
// import * as echarts from 'echarts'; // 如果你使用 ECharts

const dashboardStats = ref({
  // totalUsers: 0, // 移除 totalUsers 屬性
  totalWorkouts: 0,
  totalWorkoutMinutes: 0,
  totalCaloriesBurned: 0,
  activeUsersThisWeek: 0,
});

onMounted(() => {
  fetchDashboardStats();
});

const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get("/api/fitness/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dashboardStats.value = response.data;
    console.log("儀表板統計數據:", response.data);
  } catch (error) {
    console.error("獲取儀表板統計數據失敗", error);
    ElMessage.error("獲取儀表板統計數據失敗");
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
