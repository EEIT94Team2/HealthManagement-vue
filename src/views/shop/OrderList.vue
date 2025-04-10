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

// 移除用戶ID硬編碼
// const userId = 1;

// 獲取訂單列表
const fetchOrders = async () => {
    try {
        // 修改: 移除userId查詢參數
        const response = await axios.get(`/api/order`);
        console.log("獲取訂單列表響應:", response.data);

        // 兼容多種響應格式
        if (response.data) {
            if (response.data.status === "success" && response.data.data) {
                // {status: "success", data: [...]}
                orders.value = response.data.data;
            } else if (response.data.success && response.data.data) {
                // {success: true, data: [...]}
                orders.value = response.data.data;
            } else if (Array.isArray(response.data)) {
                // 直接返回數組
                orders.value = response.data;
            } else {
                console.error("獲取訂單列表失敗: 響應格式不符合預期");
                console.log("完整響應:", response.data);
                orders.value = [];
                ElMessage.error("獲取訂單列表失敗，API響應格式不符");
            }
        } else {
            orders.value = [];
            ElMessage.error("獲取訂單列表失敗，沒有收到響應數據");
        }
    } catch (error) {
        console.error("獲取訂單列表失敗:", error);
        if (error.response) {
            console.error("錯誤狀態:", error.response.status);
            console.error("錯誤數據:", error.response.data);
        }
        orders.value = [];
        ElMessage.error("獲取訂單列表失敗");
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

onMounted(fetchOrders);
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
</style>
