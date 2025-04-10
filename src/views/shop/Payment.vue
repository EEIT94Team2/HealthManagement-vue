<template>
    <div class="payment-container">
        <el-card class="payment-card">
            <template #header>
                <div class="card-header">
                    <h2>訂單支付</h2>
                </div>
            </template>

            <div v-if="loading" class="loading">
                <el-skeleton :rows="3" animated />
            </div>

            <div v-else-if="error" class="error-message">
                <el-alert :title="error" type="error" :closable="false" />
                <el-button type="primary" @click="$router.push('/shop/orders')" class="mt-4">
                    返回訂單列表
                </el-button>
            </div>

            <div v-else class="payment-content">
                <div class="order-info">
                    <h3>訂單信息</h3>
                    <div class="info-item">
                        <span class="label">訂單編號：</span>
                        <span class="value">{{ order.id }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">訂單金額：</span>
                        <span class="value price">${{ order.totalAmount }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">訂單狀態：</span>
                        <el-tag :type="getStatusType(order.status)">
                            {{ getStatusText(order.status) }}
                        </el-tag>
                    </div>
                </div>

                <div class="payment-methods">
                    <h3>選擇支付方式</h3>
                    <el-radio-group v-model="paymentMethod">
                        <el-radio label="credit_card">信用卡支付</el-radio>
                        <el-radio label="line_pay">Line Pay</el-radio>
                        <el-radio label="points">點數支付</el-radio>
                    </el-radio-group>
                </div>

                <div class="payment-action">
                    <el-button type="primary" :loading="paying" @click="handlePayment">
                        確認支付
                    </el-button>
                    <el-button @click="$router.push('/shop/orders')">返回訂單列表</el-button>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const orderId = route.params.id;

const order = ref({});
const loading = ref(true);
const paying = ref(false);
const error = ref("");
const paymentMethod = ref("credit_card");

// 獲取訂單詳情
const fetchOrderDetail = async () => {
    try {
        loading.value = true;
        const response = await axios.get(`/api/order/${orderId}`);

        if (response.data && (response.data.success || response.data.status === "success")) {
            order.value = response.data.data || response.data;

            // 如果訂單已支付，顯示錯誤
            if (order.value.status !== "PENDING_PAYMENT") {
                error.value = "該訂單已支付或已取消";
            }
        } else {
            throw new Error(response.data?.message || "獲取訂單詳情失敗");
        }
    } catch (error) {
        console.error("獲取訂單詳情失敗:", error);
        error.value = "獲取訂單詳情失敗，請稍後重試";
    } finally {
        loading.value = false;
    }
};

// 處理支付
const handlePayment = async () => {
    try {
        paying.value = true;

        // 模擬支付請求
        const response = await axios.post(`/api/order/${orderId}/pay`, {
            paymentMethod: paymentMethod.value,
        });

        if (response.data && (response.data.success || response.data.status === "success")) {
            ElMessage.success("支付成功！");
            router.push("/shop/orders");
        } else {
            throw new Error(response.data?.message || "支付失敗");
        }
    } catch (error) {
        console.error("支付失敗:", error);
        ElMessage.error(error.response?.data?.message || "支付失敗，請稍後重試");
    } finally {
        paying.value = false;
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

onMounted(() => {
    fetchOrderDetail();
});
</script>

<style scoped>
.payment-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.payment-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.payment-content {
    padding: 20px 0;
}

.order-info {
    margin-bottom: 30px;
}

.info-item {
    margin: 15px 0;
    display: flex;
    align-items: center;
}

.label {
    width: 100px;
    color: #606266;
}

.value {
    font-weight: bold;
}

.price {
    color: #ff6b6b;
    font-size: 18px;
}

.payment-methods {
    margin: 30px 0;
}

.payment-action {
    margin-top: 30px;
    display: flex;
    gap: 20px;
    justify-content: center;
}

.loading {
    padding: 20px;
}

.error-message {
    text-align: center;
    padding: 20px;
}

.mt-4 {
    margin-top: 16px;
}
</style>
