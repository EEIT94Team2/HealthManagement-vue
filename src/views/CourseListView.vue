<template>
    <div class="course-list">
        <h1>課程列表</h1>
        <div class="course-grid" v-if="!loading">
            <div v-for="course in courses" :key="course.id" class="course-card">
                <h3>{{ course.name }}</h3>
                <p class="description">{{ course.description }}</p>
                <div class="course-info">
                    <p><strong>教練:</strong> {{ course.coachName }}</p>
                    <p><strong>日期:</strong> {{ formatDate(course.date) }}</p>
                    <p><strong>時長:</strong> {{ course.duration }} 分鐘</p>
                    <p><strong>容量:</strong> {{ course.maxCapacity }} 人</p>
                </div>
                <button @click="viewCourseDetail(course.id)" class="view-button">查看詳情</button>
            </div>
        </div>
        <div v-else class="loading">載入中...</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { courseService } from "@/api/services/course";

const router = useRouter();
const courses = ref([]);
const loading = ref(true);

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("zh-TW");
};

const viewCourseDetail = (courseId) => {
    router.push(`/courses/${courseId}`);
};

const fetchCourses = async () => {
    try {
        loading.value = true;
        const response = await courseService.getAllCourses();
        courses.value = response.data;
    } catch (error) {
        console.error("獲取課程列表失敗:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchCourses();
});
</script>

<style scoped>
.course-list {
    padding: 2rem;
}

.course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.course-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transition: transform 0.2s;
}

.course-card:hover {
    transform: translateY(-4px);
}

.description {
    color: #666;
    margin: 1rem 0;
}

.course-info {
    margin: 1rem 0;
}

.course-info p {
    margin: 0.5rem 0;
}

.view-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.view-button:hover {
    background-color: #45a049;
}

.loading {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: #666;
}
</style>
