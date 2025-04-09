<template>
  <div>
    <h1>目標設定與進度監控</h1>

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
      <el-form-item label="日期範圍">
        <el-date-picker
          v-model="searchForm.startDateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchGoalsProgress">查詢</el-button>
        <el-button @click="resetSearchForm">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="goalsProgress" border style="width: 100%">
      <el-table-column prop="userId" label="用戶 ID"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="goalType" label="目標類型"></el-table-column>
      <el-table-column prop="targetValue" label="目標值"></el-table-column>
      <el-table-column prop="currentValue" label="目前進度"></el-table-column>
      <el-table-column prop="startDate" label="開始日期"></el-table-column>
      <el-table-column prop="endDate" label="結束日期"></el-table-column>
      <el-table-column prop="status" label="狀態"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row.id)"
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
        v-model:pageSize="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <el-button @click="openEditDialog(null)">新增目標</el-button>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '編輯目標' : '新增目標'"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input
            v-model="editForm.userId"
            :disabled="editForm.id"
          ></el-input>
        </el-form-item>
        <el-form-item label="目標類型">
          <el-input v-model="editForm.goalType"></el-input>
        </el-form-item>
        <el-form-item label="目標值">
          <el-input-number
            v-model="editForm.targetValue"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="目前進度">
          <el-input-number
            v-model="editForm.currentValue"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="開始日期">
          <el-date-picker
            v-model="editForm.startDate"
            type="date"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="結束日期">
          <el-date-picker
            v-model="editForm.endDate"
            type="date"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="editForm.status">
            <el-option label="進行中" value="進行中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
          </el-select>
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

const goalsProgress = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  userId: "",
  name: "",
  startDateRange: null,
});
const editDialogVisible = ref(false);
const editForm = reactive({
  id: null,
  userId: null,
  goalType: "",
  targetValue: null,
  currentValue: null,
  startDate: null,
  endDate: null,
  status: "進行中",
});

const fetchGoalsProgress = async () => {
  const params = {};
  if (searchForm.userId) {
    params.userId = searchForm.userId;
  }
  if (searchForm.name) {
    params.name = searchForm.name;
  }
  if (searchForm.startDateRange) {
    params.startDate = searchForm.startDateRange
      ? searchForm.startDateRange[0]
      : undefined;
    params.endDate = searchForm.startDateRange
      ? searchForm.startDateRange[1]
      : undefined;
  }
  params.page = currentPage.value - 1;
  params.size = pageSize.value;

  try {
    const response = await axios.get("/api/admin/goals-progress", { params });
    goalsProgress.value = response.data.content;
    total.value = response.data.totalElements;

    if (
      goalsProgress.value.length === 0 &&
      (searchForm.userId || searchForm.name || searchForm.startDateRange)
    ) {
      ElMessage.warning("查無符合條件的目標與進度");
    }
  } catch (error) {
    console.error("獲取用戶目標與進度失敗", error);
    ElMessage.error("獲取用戶目標與進度失敗");
  }
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.startDateRange = null;
  currentPage.value = 1;
  fetchGoalsProgress();
};

const openEditDialog = (row) => {
  if (row) {
    Object.assign(editForm, row);
  } else {
    editForm.id = null;
    editForm.userId = null;
    editForm.goalType = "";
    editForm.targetValue = null;
    editForm.currentValue = null;
    editForm.startDate = null;
    editForm.endDate = null;
    editForm.status = "進行中";
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    const payload = {
      userId: editForm.userId,
      goalType: editForm.goalType,
      targetValue: editForm.targetValue,
      currentValue: editForm.currentValue,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      status: editForm.status,
    };
    if (editForm.id) {
      await axios.put(`/api/admin/goals-progress/${editForm.id}`, payload);
      ElMessage.success("目標與進度更新成功");
    } else {
      await axios.post("/api/admin/goals-progress", payload);
      ElMessage.success("目標新增成功");
    }
    editDialogVisible.value = false;
    fetchGoalsProgress();
  } catch (error) {
    console.error(editForm.id ? "更新目標與進度失敗" : "新增目標失敗", error);
    ElMessage.error(editForm.id ? "更新目標與進度失敗" : "新增目標失敗");
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`/api/admin/goals-progress/${id}`);
    ElMessage.success("目標已刪除");
    fetchGoalsProgress();
  } catch (error) {
    console.error("刪除目標失敗", error);
    ElMessage.error("刪除目標失敗");
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchGoalsProgress();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchGoalsProgress();
};

onMounted(() => {
  fetchGoalsProgress();
});
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination .el-button {
  /* 可以根據需要調整樣式以更接近重置按鈕 */
  /* 例如： */
  /* background-color: #fff; */
  /* color: #606266; */
  /* border-color: #dcdfe6; */
}
</style>
