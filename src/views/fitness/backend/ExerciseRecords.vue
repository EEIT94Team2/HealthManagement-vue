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
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column
        prop="userId"
        label="用戶 ID"
        width="100"
      ></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="type" label="運動類型"></el-table-column>
      <el-table-column
        prop="duration"
        label="運動時間 (分鐘)"
      ></el-table-column>
      <el-table-column
        prop="caloriesBurned"
        label="消耗卡路里"
      ></el-table-column>
      <el-table-column prop="date" label="日期"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)"
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
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <el-button @click="openEditDialog(null)">新增資料</el-button>
    </div>

    <el-dialog v-model="editDialogVisible" title="新增運動紀錄">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input v-model="editForm.userId"></el-input>
        </el-form-item>
        <el-form-item label="運動類型">
          <el-input v-model="editForm.type"></el-input>
        </el-form-item>
        <el-form-item label="運動時間 (分鐘)">
          <el-input-number
            v-model="editForm.duration"
            :min="1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="消耗卡路里">
          <el-input-number
            v-model="editForm.caloriesBurned"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="editForm.date"
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
  id: null,
  userId: null,
  name: "", // 仍然保留在 editForm 中，用於編輯
  type: "",
  duration: null,
  caloriesBurned: null,
  date: null,
});

const fetchWorkoutRecords = async () => {
  if (!searchForm.userId && !searchForm.name) {
    ElMessage.warning("請輸入用戶 ID 或姓名進行查詢");
    return;
  }

  try {
    const params = {
      page: currentPage.value - 1, // 後端通常從 0 開始
      size: pageSize.value,
      userId: searchForm.userId || undefined,
      name: searchForm.name || undefined,
      type: searchForm.type || undefined,
      startDate: searchForm.dateRange ? searchForm.dateRange[0] : undefined,
      endDate: searchForm.dateRange ? searchForm.dateRange[1] : undefined,
    };
    const response = await axios.get("/api/admin/workouts", { params });
    workoutRecords.value = response.data.content;
    total.value = response.data.totalElements;

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
  fetchWorkoutRecords();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchWorkoutRecords();
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
    editForm.id = row.id;
    editForm.userId = row.userId;
    editForm.name = row.name;
    editForm.type = row.type;
    editForm.duration = row.duration;
    editForm.caloriesBurned = row.caloriesBurned;
    editForm.date = row.date;
  } else {
    // 新增時重置表單，但不重置 name
    editForm.id = null;
    editForm.userId = null;
    editForm.name = ""; // 為了編輯時使用，這裡可以保留或設定為 null
    editForm.type = "";
    editForm.duration = null;
    editForm.caloriesBurned = null;
    editForm.date = null;
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    if (editForm.id) {
      await axios.put(`/api/admin/workouts/${editForm.id}`, editForm);
      ElMessage.success("健身紀錄更新成功");
    } else {
      await axios.post("/api/admin/workouts", {
        userId: editForm.userId,
        type: editForm.type,
        duration: editForm.duration,
        caloriesBurned: editForm.caloriesBurned,
        date: editForm.date,
      });
      ElMessage.success("健身紀錄新增成功");
    }
    editDialogVisible.value = false;
    fetchWorkoutRecords();
  } catch (error) {
    console.error(editForm.id ? "更新健身紀錄失敗" : "新增健身紀錄失敗", error);
    ElMessage.error(editForm.id ? "更新健身紀錄失敗" : "新增健身紀錄失敗");
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`/api/admin/workouts/${id}`);
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
