<template>
    <div class="payment-simulation">
        <el-card class="payment-container">
            <template #header>
                <div class="payment-header">
                    <h2>模擬支付</h2>
                    <el-button @click="$router.push('/shop/orders')" size="small"
                        >返回訂單列表</el-button
                    >
                </div>
            </template>

            <!-- 查詢訂單表單 -->
            <div v-if="!order" class="search-order">
                <h3>查詢訂單</h3>
                <el-form :model="searchForm" label-width="100px" @submit.prevent="fetchOrder">
                    <el-form-item label="訂單編號">
                        <el-input
                            v-model="searchForm.orderId"
                            placeholder="請輸入訂單編號"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="fetchOrder">查詢</el-button>
                        <el-button type="success" @click="$router.push('/shop/cart')"
                            >前往購物車</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>

            <!-- 訂單信息和支付表單 -->
            <div v-else>
                <div class="order-info">
                    <h3>訂單信息</h3>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="訂單編號">{{ order.id }}</el-descriptions-item>
                        <el-descriptions-item label="訂單狀態">
                            <el-tag :type="getStatusType(order.status)">{{
                                getStatusText(order.status)
                            }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="訂單金額"
                            >${{ order.totalAmount }}</el-descriptions-item
                        >
                        <el-descriptions-item label="下單時間">{{
                            formatDate(order.createdTime)
                        }}</el-descriptions-item>
                    </el-descriptions>

                    <h3 class="mt-4">訂單商品</h3>
                    <el-table :data="order.items" style="width: 100%">
                        <el-table-column label="商品名稱" prop="product.name"></el-table-column>
                        <el-table-column label="單價" width="120">
                            <template #default="{ row }">${{ row.product.price }}</template>
                        </el-table-column>
                        <el-table-column label="數量" width="100" prop="quantity"></el-table-column>
                        <el-table-column label="小計" width="120">
                            <template #default="{ row }"
                                >${{ (row.product.price * row.quantity).toFixed(2) }}</template
                            >
                        </el-table-column>
                    </el-table>
                </div>

                <div v-if="order.status === 'PENDING_PAYMENT'" class="payment-form mt-4">
                    <h3>付款信息</h3>
                    <el-form
                        :model="paymentForm"
                        label-width="120px"
                        @submit.prevent="processPayment"
                    >
                        <el-form-item label="支付方式">
                            <el-radio-group v-model="paymentForm.paymentMethod">
                                <el-radio label="CREDIT_CARD">信用卡</el-radio>
                                <el-radio label="BANK_TRANSFER">銀行轉賬</el-radio>
                                <el-radio label="CASH_ON_DELIVERY">貨到付款</el-radio>
                            </el-radio-group>
                        </el-form-item>

                        <!-- 根據支付方式顯示不同表單 -->
                        <template v-if="paymentForm.paymentMethod === 'CREDIT_CARD'">
                            <el-form-item label="卡號">
                                <el-input
                                    v-model="paymentForm.cardNumber"
                                    placeholder="請輸入信用卡號"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="持卡人姓名">
                                <el-input
                                    v-model="paymentForm.cardHolderName"
                                    placeholder="請輸入持卡人姓名"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="到期日">
                                <el-date-picker
                                    v-model="paymentForm.expiryDate"
                                    type="month"
                                    placeholder="選擇到期日"
                                    format="MM/YYYY"
                                ></el-date-picker>
                            </el-form-item>
                            <el-form-item label="安全碼">
                                <el-input
                                    v-model="paymentForm.cvv"
                                    placeholder="CVV"
                                    style="width: 100px"
                                ></el-input>
                            </el-form-item>
                        </template>

                        <template v-if="paymentForm.paymentMethod === 'BANK_TRANSFER'">
                            <el-form-item label="銀行名稱">
                                <el-select v-model="paymentForm.bankName" placeholder="請選擇銀行">
                                    <el-option label="台灣銀行" value="Bank of Taiwan"></el-option>
                                    <el-option label="中國信託" value="CTBC Bank"></el-option>
                                    <el-option
                                        label="國泰世華"
                                        value="Cathay United Bank"
                                    ></el-option>
                                    <el-option label="玉山銀行" value="E.SUN Bank"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="帳號">
                                <el-input
                                    v-model="paymentForm.accountNumber"
                                    placeholder="請輸入銀行帳號"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="戶名">
                                <el-input
                                    v-model="paymentForm.accountName"
                                    placeholder="請輸入戶名"
                                ></el-input>
                            </el-form-item>
                        </template>

                        <template v-if="paymentForm.paymentMethod === 'CASH_ON_DELIVERY'">
                            <el-form-item label="收件人">
                                <el-input
                                    v-model="paymentForm.recipientName"
                                    placeholder="請輸入收件人姓名"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="聯絡電話">
                                <el-input
                                    v-model="paymentForm.phone"
                                    placeholder="請輸入聯絡電話"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="收件地址">
                                <el-input
                                    v-model="paymentForm.address"
                                    placeholder="請輸入收件地址"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="備註">
                                <el-input
                                    v-model="paymentForm.notes"
                                    type="textarea"
                                    placeholder="備註信息"
                                ></el-input>
                            </el-form-item>
                        </template>

                        <el-form-item>
                            <el-button type="primary" @click="processPayment" :loading="loading"
                                >確認支付</el-button
                            >
                            <el-button @click="resetPaymentForm">重置</el-button>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-else class="payment-status">
                    <el-result
                        :icon="order.status === 'PAID' ? 'success' : 'warning'"
                        :title="order.status === 'PAID' ? '支付成功' : '訂單狀態'"
                        :sub-title="`訂單編號: ${order.id}, 狀態: ${getStatusText(order.status)}`"
                    >
                        <template #extra>
                            <el-button type="primary" @click="$router.push('/shop/orders')"
                                >查看所有訂單</el-button
                            >
                            <el-button @click="resetOrder">查詢其他訂單</el-button>
                        </template>
                    </el-result>
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
const orderId = ref(route.query.orderId);
const order = ref(null);
const loading = ref(false);
const searchForm = ref({
    orderId: orderId.value || "",
});

const paymentForm = ref({
    paymentMethod: "CREDIT_CARD",
    // 信用卡信息
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
    // 銀行轉賬信息
    bankName: "",
    accountNumber: "",
    accountName: "",
    // 貨到付款信息
    recipientName: "",
    phone: "",
    address: "",
    notes: "",
});

// 獲取訂單信息
const fetchOrder = async () => {
    if (!searchForm.value.orderId) {
        ElMessage.warning("請輸入訂單編號");
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(`/api/order/${searchForm.value.orderId}`);
        if (response.data.status === "success") {
            order.value = response.data.data;
            if (order.value.status !== "PENDING_PAYMENT" && order.value.status !== "PAID") {
                ElMessage.warning(
                    `此訂單狀態為${getStatusText(order.value.status)}，無法進行支付操作`
                );
            }
        } else {
            ElMessage.error(response.data.message || "獲取訂單失敗");
        }
    } catch (error) {
        console.error("獲取訂單失敗:", error);
        ElMessage.error("獲取訂單失敗，請稍後重試");
    } finally {
        loading.value = false;
    }
};

// 處理支付
const processPayment = async () => {
    if (order.value.status !== "PENDING_PAYMENT") {
        ElMessage.warning("此訂單無法支付");
        return;
    }

    // 簡單驗證
    if (paymentForm.value.paymentMethod === "CREDIT_CARD") {
        if (
            !paymentForm.value.cardNumber ||
            !paymentForm.value.cardHolderName ||
            !paymentForm.value.expiryDate ||
            !paymentForm.value.cvv
        ) {
            ElMessage.warning("請填寫完整的信用卡信息");
            return;
        }
    } else if (paymentForm.value.paymentMethod === "BANK_TRANSFER") {
        if (
            !paymentForm.value.bankName ||
            !paymentForm.value.accountNumber ||
            !paymentForm.value.accountName
        ) {
            ElMessage.warning("請填寫完整的銀行轉賬信息");
            return;
        }
    } else if (paymentForm.value.paymentMethod === "CASH_ON_DELIVERY") {
        if (
            !paymentForm.value.recipientName ||
            !paymentForm.value.phone ||
            !paymentForm.value.address
        ) {
            ElMessage.warning("請填寫完整的收件人信息");
            return;
        }
    }

    loading.value = true;
    try {
        const paymentRequest = {
            orderId: order.value.id,
            paymentMethod: paymentForm.value.paymentMethod,
            amount: order.value.totalAmount,
            // 根據支付方式添加額外信息
            ...getPaymentDetails(),
        };

        // 發送支付請求
        const response = await axios.post(`/api/order/${order.value.id}/payment`, paymentRequest);

        if (response.data.status === "success") {
            // 模擬支付回調
            await simulatePaymentCallback(response.data.data.paymentId);
        } else {
            ElMessage.error(response.data.message || "支付失敗");
        }
    } catch (error) {
        console.error("支付處理失敗:", error);
        ElMessage.error("支付處理失敗，請稍後重試");
    } finally {
        loading.value = false;
    }
};

// 根據支付方式獲取詳細信息
const getPaymentDetails = () => {
    if (paymentForm.value.paymentMethod === "CREDIT_CARD") {
        return {
            cardNumber: paymentForm.value.cardNumber,
            cardHolderName: paymentForm.value.cardHolderName,
            expiryDate: paymentForm.value.expiryDate,
            cvv: paymentForm.value.cvv,
        };
    } else if (paymentForm.value.paymentMethod === "BANK_TRANSFER") {
        return {
            bankName: paymentForm.value.bankName,
            accountNumber: paymentForm.value.accountNumber,
            accountName: paymentForm.value.accountName,
        };
    } else if (paymentForm.value.paymentMethod === "CASH_ON_DELIVERY") {
        return {
            shippingInfo: {
                recipientName: paymentForm.value.recipientName,
                phone: paymentForm.value.phone,
                address: paymentForm.value.address,
                notes: paymentForm.value.notes,
            },
        };
    }
    return {};
};

// 模擬支付回調
const simulatePaymentCallback = async (paymentId) => {
    try {
        const response = await axios.post(`/api/order/payment/${paymentId}/mock`);

        if (response.data.status === "success") {
            ElMessage.success("支付成功");
            // 重新獲取訂單信息
            await fetchOrder();
        } else {
            ElMessage.error(response.data.message || "支付回調處理失敗");
        }
    } catch (error) {
        console.error("支付回調處理失敗:", error);
        ElMessage.error("支付回調處理失敗，請稍後重試");
    }
};

// 重置支付表單
const resetPaymentForm = () => {
    paymentForm.value = {
        paymentMethod: "CREDIT_CARD",
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        recipientName: "",
        phone: "",
        address: "",
        notes: "",
    };
};

// 重置訂單
const resetOrder = () => {
    order.value = null;
    searchForm.value.orderId = "";
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

onMounted(() => {
    if (orderId.value) {
        fetchOrder();
    }
});
</script>

<style scoped>
.payment-simulation {
    padding: 20px;
}

.payment-container {
    max-width: 1200px;
    margin: 0 auto;
}

.payment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-order,
.order-info,
.payment-form,
.payment-status {
    margin-bottom: 30px;
}

h3 {
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: bold;
}

.mt-4 {
    margin-top: 20px;
}
</style>
