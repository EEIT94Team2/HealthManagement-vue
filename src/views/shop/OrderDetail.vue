<template>
    <div class="order-detail">
        <el-card class="detail-container">
            <template #header>
                <div class="detail-header">
                    <h2>訂單詳情</h2>
                    <el-button @click="$router.back()">返回</el-button>
                </div>
            </template>

            <div v-if="loading" class="loading">
                <el-skeleton :rows="10" animated />
            </div>

            <div v-else-if="!order" class="not-found">
                <el-empty description="訂單不存在">
                    <el-button type="primary" @click="$router.push('/shop/orders')">
                        返回訂單列表
                    </el-button>
                </el-empty>
            </div>

            <div v-else class="order-info">
                <div class="info-section">
                    <h3>訂單信息</h3>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="訂單編號">
                            {{ order.id }}
                        </el-descriptions-item>
                        <el-descriptions-item label="訂單狀態">
                            <el-tag :type="getStatusType(order.status)">
                                {{ getStatusText(order.status) }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="下單時間">
                            {{ formatDate(order.createdTime) }}
                        </el-descriptions-item>
                        <el-descriptions-item label="總金額">
                            ${{ order.totalAmount }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>

                <div class="info-section">
                    <h3>商品信息</h3>
                    <el-table :data="order.items" style="width: 100%">
                        <el-table-column label="商品" min-width="400">
                            <template #default="{ row }">
                                <div class="product-info">
                                    <el-image
                                        :src="
                                            row.product.imageUrl || 'https://via.placeholder.com/80'
                                        "
                                        fit="cover"
                                        class="product-image"
                                    />
                                    <div class="product-details">
                                        <h4>{{ row.product.name }}</h4>
                                        <p class="price">${{ row.product.price }}</p>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column prop="quantity" label="數量" width="120" />

                        <el-table-column label="小計" width="150">
                            <template #default="{ row }"> ${{ calculateSubtotal(row) }} </template>
                        </el-table-column>
                    </el-table>
                </div>

                <div v-if="order.shippingInfo" class="info-section">
                    <h3>收貨信息</h3>
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="收貨人">
                            {{ order.shippingInfo.recipientName }}
                        </el-descriptions-item>
                        <el-descriptions-item label="聯繫電話">
                            {{ order.shippingInfo.phone }}
                        </el-descriptions-item>
                        <el-descriptions-item label="收貨地址">
                            {{ order.shippingInfo.address }}
                        </el-descriptions-item>
                        <el-descriptions-item label="備註">
                            {{ order.shippingInfo.notes || "無" }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>

                <div v-if="order.paymentInfo" class="info-section">
                    <h3>支付信息</h3>
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="支付方式">
                            {{ getPaymentMethodText(order.paymentInfo.paymentMethod) }}
                        </el-descriptions-item>
                        <el-descriptions-item label="支付狀態">
                            <el-tag :type="getPaymentStatusType(order.paymentInfo.status)">
                                {{ getPaymentStatusText(order.paymentInfo.status) }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item v-if="order.paymentInfo.paymentTime" label="支付時間">
                            {{ formatDate(order.paymentInfo.paymentTime) }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>

                <div class="actions">
                    <el-button
                        v-if="order.status === 'PENDING_PAYMENT'"
                        type="primary"
                        @click="handlePayment"
                    >
                        去支付
                    </el-button>
                    <el-button
                        v-if="order.status === 'PENDING_PAYMENT'"
                        type="danger"
                        @click="cancelOrder"
                    >
                        取消訂單
                    </el-button>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const order = ref(null);
const loading = ref(true);
const orderId = route.params.id;

// 移除用戶ID硬編碼
// const userId = 1;

// 獲取訂單詳情
const fetchOrderDetail = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`/api/order/${orderId}`);
        if (response.data.status === "success") {
            order.value = response.data.data;
        } else {
            ElMessage.error(response.data.message || "獲取訂單詳情失敗");
        }
    } catch (error) {
        console.error("獲取訂單詳情失敗:", error);
        ElMessage.error("獲取訂單詳情失敗");
    } finally {
        loading.value = false;
    }
};

// 前往支付
const handlePayment = () => {
    router.push(`/shop/payment/${orderId}`);
};

// 取消訂單 - 注意：API中沒有明確的取消訂單端點，可能需要調整
const cancelOrder = async () => {
    try {
        await ElMessageBox.confirm("確定要取消此訂單嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning",
        });

        // 注意：以下API在您的列表中沒有列出
        // 可能需要使用其他方式取消訂單或聯繫後端添加此API
        ElMessage.warning("訂單取消功能暫不可用，請聯繫客服");

        /* 
        await axios.post(`/api/order/${orderId}/cancel`);
        ElMessage.success("訂單已取消");
        fetchOrderDetail();
        */
    } catch (error) {
        if (error !== "cancel") {
            console.error("取消訂單失敗:", error);
            ElMessage.error("取消訂單失敗");
        }
    }
};

// 計算小計
const calculateSubtotal = (item) => {
    return (item.product.price * item.quantity).toFixed(2);
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

// 獲取訂單狀態標籤類型
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

// 獲取訂單狀態文字
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

// 獲取支付方式文字
const getPaymentMethodText = (method) => {
    const methods = {
        CREDIT_CARD: "信用卡",
        CASH_ON_DELIVERY: "貨到付款",
        BANK_TRANSFER: "銀行轉賬",
    };
    return methods[method] || method;
};

// 獲取支付狀態標籤類型
const getPaymentStatusType = (status) => {
    const types = {
        PENDING: "warning",
        PAID: "success",
        FAILED: "danger",
        REFUNDED: "info",
    };
    return types[status] || "info";
};

// 獲取支付狀態文字
const getPaymentStatusText = (status) => {
    const texts = {
        PENDING: "待支付",
        PAID: "已支付",
        FAILED: "支付失敗",
        REFUNDED: "已退款",
    };
    return texts[status] || status;
};

onMounted(fetchOrderDetail);
</script>

<style scoped>
.order-detail {
    padding: 20px;
}

.detail-container {
    max-width: 1200px;
    margin: 0 auto;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.loading,
.not-found {
    padding: 40px 0;
}

.info-section {
    margin-bottom: 30px;
}

.info-section h3 {
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: bold;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.product-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
}

.product-details h4 {
    margin: 0 0 8px;
    font-size: 16px;
}

.price {
    color: #f56c6c;
    margin: 0;
    font-weight: bold;
}

.actions {
    margin-top: 30px;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
}
</style>
