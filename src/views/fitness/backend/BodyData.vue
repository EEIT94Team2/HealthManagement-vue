<template>
  <div>
    <h1>身體數據管理</h1>

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
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchBodyData">查詢</el-button>
        <el-button @click="resetSearchForm">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="bodyData" border style="width: 100%">
      <el-table-column prop="userId" label="用戶 ID"></el-table-column>
      <el-table-column prop="userName" label="姓名"></el-table-column>
      <el-table-column prop="weight" label="體重 (公斤)"></el-table-column>
      <el-table-column prop="bodyFat" label="體脂率 (%)"></el-table-column>
      <el-table-column prop="height" label="身高 (公分)"></el-table-column>
      <el-table-column
        prop="waistCircumference"
        label="腰圍 (公分)"
      ></el-table-column>
      <el-table-column
        prop="hipCircumference"
        label="臀圍 (公分)"
      ></el-table-column>
      <el-table-column prop="dateRecorded" label="測量日期"></el-table-column>
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
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <el-button @click="openEditDialog(null)">新增資料</el-button>
    </div>

    <el-dialog
      :title="editDialogVisible ? '編輯身體數據' : '新增身體數據'"
      v-model="editDialogVisible"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input
            v-model="editForm.userId"
            :disabled="editForm.id"
          ></el-input>
        </el-form-item>
        <el-form-item label="體重 (公斤)">
          <el-input-number
            v-model="editForm.weight"
            :min="0"
            step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="體脂率 (%)">
          <el-input-number
            v-model="editForm.bodyFat"
            :min="0"
            :max="100"
            step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="身高 (公分)">
          <el-input-number
            v-model="editForm.height"
            :min="0"
            step="1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="腰圍 (公分)">
          <el-input-number
            v-model="editForm.waistCircumference"
            :min="0"
            step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="臀圍 (公分)">
          <el-input-number
            v-model="editForm.hipCircumference"
            :min="0"
            step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="測量日期">
          <el-date-picker
            v-model="editForm.dateRecorded"
            type="date"
            placeholder="選擇日期"
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

const bodyData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  userId: "",
  name: "",
  dateRange: null,
});

const editDialogVisible = ref(false);
const editForm = reactive({
  id: null,
  userId: null,
  userName: "", // 用於表格顯示
  weight: null,
  bodyFat: null,
  height: null,
  waistCircumference: null,
  hipCircumference: null,
  dateRecorded: null,
});

const fetchBodyData = async () => {
  const params = {
    page: currentPage.value - 1,
    size: pageSize.value,
    userId: searchForm.userId || undefined,
    name: searchForm.name || undefined,
    startDate: searchForm.dateRange ? searchForm.dateRange[0] : undefined,
    endDate: searchForm.dateRange ? searchForm.dateRange[1] : undefined,
  };

  try {
    const response = await axios.get("/tracking/body-metrics/search", {
      params,
    });
    bodyData.value = response.data; // 假設後端直接返回 DTO 列表
    total.value = response.data.length; // 假設後端沒有提供 totalElements

    if (
      bodyData.value.length === 0 &&
      (searchForm.userId || searchForm.name || searchForm.dateRange)
    ) {
      ElMessage.warning("查無符合條件的身體數據");
    }
  } catch (error) {
    console.error("獲取身體數據失敗", error);
    ElMessage.error("獲取身體數據失敗");
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  // 如果後端沒有分頁，前端處理分頁
  // fetchBodyData();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  // 如果後端沒有分頁，前端處理分頁
  // fetchBodyData();
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.dateRange = null;
  currentPage.value = 1;
  fetchBodyData();
};

const openEditDialog = (row) => {
  if (row) {
    editForm.id = row.id;
    editForm.userId = row.userId;
    editForm.userName = row.userName;
    editForm.weight = row.weight;
    editForm.bodyFat = row.bodyFat;
    editForm.height = row.height;
    editForm.waistCircumference = row.waistCircumference;
    editForm.hipCircumference = row.hipCircumference;
    editForm.dateRecorded = row.dateRecorded;
  } else {
    editForm.id = null;
    editForm.userId = null;
    editForm.userName = "";
    editForm.weight = null;
    editForm.bodyFat = null;
    editForm.height = null;
    editForm.waistCircumference = null;
    editForm.hipCircumference = null;
    editForm.dateRecorded = null;
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    const payload = {
      userId: editForm.userId,
      weight: editForm.weight,
      bodyFat: editForm.bodyFat,
      height: editForm.height,
      waistCircumference: editForm.waistCircumference,
      hipCircumference: editForm.hipCircumference,
      dateRecorded: editForm.dateRecorded,
    };

    if (editForm.id) {
      await axios.put(`/tracking/body-metrics/${editForm.id}`, payload);
      ElMessage.success("身體數據更新成功");
    } else {
      await axios.post("/tracking/body-metrics", payload);
      ElMessage.success("身體數據新增成功");
    }
    editDialogVisible.value = false;
    fetchBodyData();
  } catch (error) {
    console.error(editForm.id ? "更新身體數據失敗" : "新增身體數據失敗", error);
    ElMessage.error(editForm.id ? "更新身體數據失敗" : "新增身體數據失敗");
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`/tracking/body-metrics/${id}`);
    ElMessage.success("身體數據刪除成功");
    fetchBodyData();
  } catch (error) {
    console.error("刪除身體數據失敗", error);
    ElMessage.error("刪除身體數據失敗");
  }
};

onMounted(() => {
  fetchBodyData();
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
  margin-left: 10px;
}
</style>
