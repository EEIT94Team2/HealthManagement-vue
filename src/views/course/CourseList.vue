<template>
  <div>
    <h1>課程列表</h1>

    <div style="margin-bottom: 20px;">
      <el-button @click="activeSearch = null; fetchCourses()" :type="activeSearch === null ? 'primary' : ''">全部課程</el-button>
      <el-button @click="activeSearch = 'byId'" :type="activeSearch === 'byId' ? 'primary' : ''" style="margin-left: 10px;">依課程編號查詢</el-button>
      <el-button @click="activeSearch = 'byName'" :type="activeSearch === 'byName' ? 'primary' : ''" style="margin-left: 10px;">依課程名稱查詢</el-button>
      <el-button @click="activeSearch = 'byCoachId'" :type="activeSearch === 'byCoachId' ? 'primary' : ''" style="margin-left: 10px;">依教練編號查詢</el-button>
      <el-button @click="activeSearch = 'byCoachName'" :type="activeSearch === 'byCoachName' ? 'primary' : ''" style="margin-left: 10px;">依教練名稱查詢</el-button>
      <el-button type="primary" @click="navigateToCreate">新增課程</el-button>
    </div>

    <section v-show="activeSearch === 'byId'" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <el-input v-model="searchById.id" placeholder="請輸入課程編號" style="width: 300px;" />
          <el-button type="primary" @click="searchCourseById" style="margin-left: 10px;">查詢</el-button>
      </div>
      <div v-if="searchById.course">
        <el-card style="margin-top: 10px;">
          <p>課程編號： {{ searchById.course.id }}</p>
          <p>課程名稱： {{ searchById.course.name }}</p>
          <p>課程內容： {{ searchById.course.description }}</p>
          <p>教練編號： {{ searchById.course.coachid }}</p>
          <p>教練姓名： {{ searchById.course.coachname }}</p>
          <p>日期： {{ searchById.course.date }}</p>
          <p>時長（分鐘）： {{ searchById.course.duration }}</p>
          <p>最大人數： {{ searchById.course.maxCapacity }}</p>
        </el-card>
      </div>
      <p v-else-if="searchById.performed && !searchById.course">沒有找到該編號的課程。</p>
    </section>

    <section v-show="activeSearch === 'byName'" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <el-input v-model="searchByName.name" placeholder="請輸入課程名稱" style="width: 300px;" />
          <el-button type="primary" @click="searchCourseByName" style="margin-left: 10px;">查詢</el-button>
      </div>
      <div v-if="searchByName.courses.length > 0">
        <el-card v-for="course in searchByName.courses" :key="course.id" style="margin-top: 10px;">
          <p>課程編號： {{ course.id }}</p>
          <p>課程名稱： {{ course.name }}</p>
          <p>課程內容： {{ course.description }}</p>
          <p>教練編號： {{ course.coachid }}</p>
          <p>教練姓名： {{ course.coachname }}</p>
          <p>日期： {{ course.date }}</p>
          <p>時長（分鐘）： {{ course.duration }}</p>
          <p>最大人數： {{ course.maxCapacity }}</p>
        </el-card>
      </div>
      <p v-else-if="searchByName.performed && searchByName.courses.length === 0">沒有找到符合該名稱的課程。</p>
    </section>

    <section v-show="activeSearch === 'byCoachId'" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <el-input v-model="searchByCoachId.coachId" placeholder="請輸入教練編號" style="width: 300px;" />
          <el-button type="primary" @click="searchCourseByCoachId" style="margin-left: 10px;">查詢</el-button>
      </div>
      <div v-if="searchByCoachId.courses.length > 0">
        <el-card v-for="course in searchByCoachId.courses" :key="course.id" style="margin-top: 10px;">
          <p>課程編號： {{ course.id }}</p>
          <p>課程名稱： {{ course.name }}</p>
          <p>課程內容： {{ course.description }}</p>
          <p>教練編號： {{ course.coachid }}</p>
          <p>教練姓名： {{ course.coachname }}</p>
          <p>日期： {{ course.date }}</p>
          <p>時長（分鐘）： {{ course.duration }}</p>
          <p>最大人數： {{ course.maxCapacity }}</p>
        </el-card>
      </div>
      <p v-else-if="searchByCoachId.performed && searchByCoachId.courses.length === 0">沒有找到該教練編號的課程。</p>
    </section>

    <section v-show="activeSearch === 'byCoachName'">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <el-input v-model="searchByCoachName.name" placeholder="請輸入教練名稱" style="width: 300px;" />
          <el-button type="primary" @click="searchCourseByCoachName" style="margin-left: 10px;">查詢</el-button>
      </div>
      <div v-if="searchByCoachName.courses.length > 0">
        <el-card v-for="course in searchByCoachName.courses" :key="course.id" style="margin-top: 10px;">
          <p>課程編號： {{ course.id }}</p>
          <p>課程名稱： {{ course.name }}</p>
          <p>課程內容： {{ course.description }}</p>
          <p>教練編號： {{ course.coachid }}</p>
          <p>教練姓名： {{ course.coachname }}</p>
          <p>日期： {{ course.date }}</p>
          <p>時長（分鐘）： {{ course.duration }}</p>
          <p>最大人數： {{ course.maxCapacity }}</p>
        </el-card>
      </div>
      <p v-else-if="searchByCoachName.performed && searchByCoachName.courses.length === 0">沒有找到該教練名稱的課程。</p>
    </section>

    <br><br>
    <el-table :data="displayedCourses" style="width: 100%" v-if="activeSearch === null">
      <el-table-column prop="id" label="課程編號" width="85" />
      <el-table-column prop="name" label="課程名稱" />
      <el-table-column prop="description" label="課程內容" />
      <el-table-column prop="date" label="日期" width="150" />
      <el-table-column prop="duration" label="時長（分鐘）" width="110" />
      <el-table-column prop="maxCapacity" label="最大人數" width="100" />
      <el-table-column prop="coach.id" label="教練編號" width="85"></el-table-column>
      <el-table-column prop="coach.name" label="教練名字"></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button @click="navigateToEdit(scope.row.id)">編輯</el-button>
          <el-button type="danger" @click="handleDelete(scope.row.id)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="activeSearch === null"
      v-model:currentPage="currentPage"
      :page-sizes="[10, 20]"
      v-model:pageSize="pageSize"
      :total="totalCourses"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; display: flex; justify-content: center;"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElTable, ElTableColumn, ElButton, ElMessage, ElPagination, ElInput, ElCard } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const courses = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCourses = ref(0);
const activeSearch = ref(null); // 控制顯示哪個查詢區塊

const searchById = reactive({ id: '', course: null, performed: false });
const searchByName = reactive({ name: '', courses: [], performed: false });
const searchByCoachId = reactive({ coachId: null, courses: [], performed: false });
const searchByCoachName = reactive({ name: '', courses: [], performed: false });

const fetchCourses = async () => {
  try {
    const response = await axios.get('/courses'); // 假設後端返回所有課程
    courses.value = response.data;
    totalCourses.value = courses.value.length;
    // Reset search states when fetching all courses
    searchById.course = null;
    searchById.performed = false;
    searchByName.courses = [];
    searchByName.performed = false;
    searchByCoachId.courses = [];
    searchByCoachId.performed = false;
    searchByCoachName.courses = [];
    searchByCoachName.performed = false;
  } catch (error) {
    console.error('獲取課程列表失敗', error);
    ElMessage.error('獲取課程列表失敗');
  }
};

const displayedCourses = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return courses.value.slice(startIndex, endIndex);
});

const navigateToCreate = () => {
  router.push('/courses/create');
};

const navigateToEdit = (id) => {
  router.push(`/courses/edit/${id}`);
};

const handleDelete = async (id) => {
  if (window.confirm('確定要刪除此課程嗎？')) {
    try {
      await axios.delete(`/courses/${id}`);
      ElMessage.success('課程刪除成功');
      fetchCourses(); // 重新獲取課程列表
    } catch (error) {
      console.error('刪除課程失敗', error);
      ElMessage.error('刪除課程失敗');
    }
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // 切換每頁筆數後回到第一頁
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
};

const searchCourseById = async () => {
  if (!searchById.id) {
    ElMessage.warning('請輸入課程編號');
    return;
  }
  try {
    const response = await axios.get(`/courses/${searchById.id}`);
    searchById.course = response.data;
    searchById.performed = true;
    activeSearch.value = 'byId';
    // Reset other search results (optional, depending on desired behavior)
    searchByName.courses = [];
    searchByCoachId.courses = [];
    searchByCoachName.courses = [];
  } catch (error) {
    console.error('依編號查詢課程失敗', error);
    searchById.course = null;
    searchById.performed = true;
    ElMessage.error('查詢失敗');
  }
};

const searchCourseByName = async () => {
  if (!searchByName.name) {
    ElMessage.warning('請輸入課程名稱');
    return;
  }
  try {
    const response = await axios.get(`/courses/course_search?name=${searchByName.name}`);
    searchByName.courses = response.data;
    searchByName.performed = true;
    activeSearch.value = 'byName';
    // Reset other search results
    searchById.course = null;
    searchByCoachId.courses = [];
    searchByCoachName.courses = [];
  } catch (error) {
    console.error('依課程名稱查詢失敗', error);
    searchByName.courses = [];
    searchByName.performed = true;
    ElMessage.error('查詢失敗');
  }
};

const searchCourseByCoachId = async () => {
  if (!searchByCoachId.coachId) {
    ElMessage.warning('請輸入教練編號');
    return;
  }
  try {
    const response = await axios.get(`/courses/coach?coachId=${searchByCoachId.coachId}`);
    searchByCoachId.courses = response.data;
    searchByCoachId.performed = true;
    activeSearch.value = 'byCoachId';
    // Reset other search results
    searchById.course = null;
    searchByName.courses = [];
    searchByCoachName.courses = [];
  } catch (error) {
    console.error('依教練編號查詢失敗', error);
    searchByCoachId.courses = [];
    searchByCoachId.performed = true;
    ElMessage.error('查詢失敗');
  }
};

const searchCourseByCoachName = async () => {
  if (!searchByCoachName.name) {
    ElMessage.warning('請輸入教練名稱');
    return;
  }
  try {
    const response = await axios.get(`/courses/coach_search?coachName=${searchByCoachName.name}`);
    searchByCoachName.courses = response.data;
    searchByCoachName.performed = true;
    activeSearch.value = 'byCoachName';
    // Reset other search results
    searchById.course = null;
    searchByName.courses = [];
    searchByCoachId.courses = [];
  } catch (error) {
    console.error('依教練名稱查詢失敗', error);
    searchByCoachName.courses = [];
    searchByCoachName.performed = true;
    ElMessage.error('查詢失敗');
  }
};

onMounted(() => {
  fetchCourses();
});
</script>