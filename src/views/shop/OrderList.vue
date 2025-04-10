<template>
    <div class="order-list">
        <el-card class="order-container">
            <template #header>
                <div class="order-header">
                    <h2>我的訂單</h2>
                </div>
            </template>

            <div v-if="orders.length === 0" class="empty-orders">
                <el-empty description="暫無訂單">
                    <el-button type="primary" @click="$router.push('/shop/cart')">
                        去購物車
                    </el-button>
                </el-empty>
            </div>

            <div v-else class="orders">
                <el-table :data="orders" style="width: 100%">
                    <el-table-column prop="id" label="訂單編號" width="120" />

                    <el-table-column label="訂單內容" min-width="400">
                        <template #default="{ row }">
                            <div class="order-items">
                                <div
                                    v-for="item in row.orderItems"
                                    :key="item.id"
                                    class="order-item"
                                >
                                    <el-image
                                        :src="
                                            item.product.imageUrl ||
                                            'https://via.placeholder.com/50'
                                        "
                                        fit="cover"
                                        class="product-image"
                                    />
                                    <div class="item-details">
                                        <span class="item-name">{{ item.product.name }}</span>
                                        <span class="item-quantity">x{{ item.quantity }}</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="totalAmount" label="總金額" width="150">
                        <template #default="{ row }"> ${{ row.totalAmount }} </template>
                    </el-table-column>

                    <el-table-column prop="status" label="狀態" width="120">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.status)">
                                {{ getStatusText(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column prop="createdAt" label="下單時間" width="180">
                        <template #default="{ row }">
                            {{ formatDate(row.createdAt) }}
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="180">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button
                                    type="primary"
                                    @click="viewOrderDetail(row.id)"
                                    size="small"
                                >
                                    查看詳情
                                </el-button>
                                <el-button
                                    v-if="row.status === 'PENDING_PAYMENT'"
                                    type="success"
                                    @click="handlePayment(row.id)"
                                    size="small"
                                >
                                    前往支付
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 添加分頁組件 -->
            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from "axios";

const router = useRouter();
const orders = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 移除用戶ID硬編碼
// const userId = 1;

// 獲取訂單列表
const fetchOrders = async () => {
    try {
        const params = {
            page: currentPage.value - 1, // 後端分頁從0開始
            size: pageSize.value,
        };

        const response = await axios.get("/api/orders", { params });

        if (response.data && (response.data.success || response.data.status === "success")) {
            const data = response.data.data || response.data;
            // 處理分頁數據
            if (data.content) {
                orders.value = data.content;
                total.value = data.totalElements;
                currentPage.value = data.number + 1; // 後端返回的頁碼從0開始，前端顯示從1開始
            } else {
                // 處理非分頁數據
                orders.value = Array.isArray(data) ? data : [];
                total.value = orders.value.length;
            }
        } else {
            throw new Error(response.data?.message || "獲取訂單列表失敗");
        }
    } catch (error) {
        console.error("獲取訂單列表失敗:", error);
        ElMessage.error(error.response?.data?.message || "獲取訂單列表失敗，請稍後重試");
        orders.value = [];
        total.value = 0;
    }
};

// 查看訂單詳情
const viewOrderDetail = (orderId) => {
    router.push(`/shop/orders/${orderId}`);
};

// 處理支付
const handlePayment = (orderId) => {
    router.push(`/shop/payment/${orderId}`);
};

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);
        return date.toLocaleString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (e) {
        return dateString;
    }
};

// 獲取狀態標籤類型
const getStatusType = (status) => {
    const types = {
        PENDING_PAYMENT: "warning",
        PAID: "success",
        PROCESSING: "primary",
        SHIPPED: "info",
        DELIVERED: "success",
        CANCELLED: "danger",
    };
    return types[status] || "info";
};

// 獲取狀態文字
const getStatusText = (status) => {
    const texts = {
        PENDING_PAYMENT: "待付款",
        PAID: "已付款",
        PROCESSING: "處理中",
        SHIPPED: "已發貨",
        DELIVERED: "已送達",
        CANCELLED: "已取消",
    };
    return texts[status] || status;
};

// 處理頁碼改變
const handleCurrentChange = async (val) => {
    currentPage.value = val;
    await fetchOrders();
};

// 處理每頁顯示數量改變
const handleSizeChange = async (val) => {
    pageSize.value = val;
    currentPage.value = 1;
    await fetchOrders();
};

onMounted(() => {
    fetchOrders();
});
</script>

<style scoped>
.order-list {
    padding: 20px;
}

.order-container {
    max-width: 1200px;
    margin: 0 auto;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.empty-orders {
    padding: 40px 0;
}

.order-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.product-image {
    width: 50px;
    height: 50px;
    border-radius: 4px;
}

.item-details {
    display: flex;
    flex-direction: column;
}

.item-name {
    font-size: 14px;
}

.item-quantity {
    color: #909399;
    font-size: 12px;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
</style>
