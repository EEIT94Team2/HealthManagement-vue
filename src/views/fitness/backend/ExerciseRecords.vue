<template>
  <div>
    <h1>健身紀錄管理</h1>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="用戶 ID">
        <el-input
          v-model="searchForm.userId"
          placeholder="輸入用戶 ID"
        ></el-input>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="輸入姓名"></el-input>
      </el-form-item>
      <el-form-item label="運動類型">
        <el-input
          v-model="searchForm.type"
          placeholder="輸入運動類型"
        ></el-input>
      </el-form-item>
      <el-form-item label="日期範圍">
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchWorkoutRecords">查詢</el-button>
        <el-button @click="resetSearchForm">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="workoutRecords" border style="width: 100%">
      <el-table-column prop="recordId" label="ID" width="80"></el-table-column>
      <el-table-column
        prop="userId"
        label="用戶 ID"
        width="100"
      ></el-table-column>
      <el-table-column prop="userName" label="姓名"></el-table-column>
      <el-table-column prop="exerciseType" label="運動類型"></el-table-column>
      <el-table-column
        prop="exerciseDuration"
        label="運動時間 (分鐘)"
      ></el-table-column>
      <el-table-column
        prop="caloriesBurned"
        label="消耗卡路里"
      ></el-table-column>
      <el-table-column prop="exerciseDate" label="日期"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row.recordId)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div
      style="
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <el-pagination
        v-model:currentPage="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <el-button @click="openEditDialog(null)">新增資料</el-button>
    </div>

    <el-dialog v-model="editDialogVisible" title="新增/編輯運動紀錄">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input
            v-model="editForm.userId"
            :disabled="!!editForm.recordId"
          ></el-input>
        </el-form-item>
        <el-form-item label="運動類型">
          <el-input v-model="editForm.exerciseType"></el-input>
        </el-form-item>
        <el-form-item label="運動時間 (分鐘)">
          <el-input-number
            v-model="editForm.exerciseDuration"
            :min="1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="editForm.exerciseDate"
            type="date"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">儲存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const workoutRecords = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  userId: "",
  name: "",
  type: "",
  dateRange: null,
});

const editDialogVisible = ref(false);
const editForm = reactive({
  recordId: null,
  userId: null,
  exerciseType: "",
  exerciseDuration: null,
  caloriesBurned: null,
  exerciseDate: null,
});

const fetchWorkoutRecords = async () => {
  const params = {
    page: currentPage.value - 1, // 後端通常從 0 開始
    size: pageSize.value,
    exerciseType: searchForm.type || undefined,
    startDate: searchForm.dateRange ? searchForm.dateRange[0] : undefined,
    endDate: searchForm.dateRange ? searchForm.dateRange[1] : undefined,
  };

  let apiUrl = "/tracking/exercise-records"; // 預設 API 路徑

  if (searchForm.userId && searchForm.name) {
    // 同時根據用戶 ID 和姓名查詢
    apiUrl = `/tracking/exercise-records/user/${searchForm.userId}/by-name?userName=${searchForm.name}`;
  } else if (searchForm.userId) {
    // 僅根據用戶 ID 查詢
    apiUrl = `/tracking/exercise-records/user/${searchForm.userId}`;
  } else if (searchForm.name) {
    // 僅根據姓名查詢
    apiUrl = `/tracking/exercise-records/by-name?userName=${searchForm.name}`;
  }

  try {
    const response = await axios.get(apiUrl, { params });
    workoutRecords.value = response.data; // 後端返回的是 DTO 列表
    total.value = response.data.length; // 假設後端沒有提供 totalElements，這裡使用返回的資料長度

    if (
      workoutRecords.value.length === 0 &&
      (searchForm.userId || searchForm.name)
    ) {
      ElMessage.warning("查無符合條件的健身紀錄");
    }
  } catch (error) {
    console.error("獲取健身紀錄失敗", error);
    ElMessage.error("獲取健身紀錄失敗");
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  // 注意：如果後端沒有分頁，前端分頁可能需要自己處理
  // fetchWorkoutRecords();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  // 注意：如果後端沒有分頁，前端分頁可能需要自己處理
  // fetchWorkoutRecords();
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.type = "";
  searchForm.dateRange = null;
  currentPage.value = 1;
  fetchWorkoutRecords();
};

const openEditDialog = (row) => {
  if (row) {
    editForm.recordId = row.recordId;
    editForm.userId = row.userId;
    editForm.exerciseType = row.exerciseType;
    editForm.exerciseDuration = row.exerciseDuration;
    editForm.caloriesBurned = row.caloriesBurned;
    editForm.exerciseDate = row.exerciseDate;
  } else {
    editForm.recordId = null;
    editForm.userId = null;
    editForm.exerciseType = "";
    editForm.exerciseDuration = null;
    editForm.caloriesBurned = null;
    editForm.exerciseDate = null;
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    if (editForm.recordId) {
      await axios.put(
        `/tracking/exercise-records/${editForm.recordId}`,
        editForm
      );
      ElMessage.success("健身紀錄更新成功");
    } else {
      await axios.post("/tracking/exercise-records", editForm);
      ElMessage.success("健身紀錄新增成功");
    }
    editDialogVisible.value = false;
    fetchWorkoutRecords();
  } catch (error) {
    console.error(
      editForm.recordId ? "更新健身紀錄失敗" : "新增健身紀錄失敗",
      error
    );
    ElMessage.error(
      editForm.recordId ? "更新健身紀錄失敗" : "新增健身紀錄失敗"
    );
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`/tracking/exercise-records/${id}`);
    ElMessage.success("健身紀錄刪除成功");
    fetchWorkoutRecords();
  } catch (error) {
    console.error("刪除健身紀錄失敗", error);
    ElMessage.error("刪除健身紀錄失敗");
  }
};

onMounted(() => {
  fetchWorkoutRecords();
});
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}

.pagination {
  display: inline-block;
}

.el-button {
  margin-left: 10px; /* 保持與重置按鈕的間距 */
}
</style>
