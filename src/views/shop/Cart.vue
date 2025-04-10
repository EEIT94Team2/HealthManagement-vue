<template>
    <div class="cart">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>購物車</span>
                    <el-button
                        v-if="cartItems.length > 0"
                        type="danger"
                        @click="clearCart"
                        size="small"
                    >
                        清空購物車
                    </el-button>
                </div>
            </template>

            <div v-if="cartItems.length === 0" class="empty-cart">
                <el-empty description="購物車是空的">
                    <el-button type="primary" @click="goToProducts">去購物</el-button>
                </el-empty>
            </div>

            <template v-else>
                <el-table :data="cartItems" style="width: 100%">
                    <el-table-column label="商品">
                        <template #default="{ row }">
                            <div class="product-info">
                                <img
                                    :src="row.product.imageUrl || 'https://via.placeholder.com/50'"
                                    class="product-image"
                                />
                                <span>{{ row.product.name }}</span>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="單價" width="120">
                        <template #default="{ row }"> ${{ row.product.price }} </template>
                    </el-table-column>

                    <el-table-column label="數量" width="200">
                        <template #default="{ row }">
                            <el-input-number
                                v-model="row.quantity"
                                :min="1"
                                @change="(value) => handleQuantityChange(row.id, value)"
                            />
                        </template>
                    </el-table-column>

                    <el-table-column label="小計" width="120">
                        <template #default="{ row }">
                            ${{ (row.product.price * row.quantity).toFixed(2) }}
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="120">
                        <template #default="{ row }">
                            <el-button type="danger" @click="handleRemove(row.id)">
                                刪除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="cart-footer">
                    <div class="total">
                        總計：<span class="price">${{ totalPrice.toFixed(2) }}</span>
                    </div>
                    <el-button type="primary" @click="handleCheckout">結算</el-button>
                </div>
            </template>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const cartItems = ref([]);
const totalPrice = ref(0);

// 獲取購物車內容
const fetchCartItems = async () => {
    try {
        const response = await axios.get(`/api/cart/items`);
        console.log("獲取購物車響應:", response.data);

        // 兼容多種響應格式
        if (response.data) {
            if (response.data.status === "success" && response.data.data) {
                // {status: "success", data: [...]}
                cartItems.value = response.data.data;
            } else if (response.data.success && response.data.data) {
                // {success: true, data: [...]}
                cartItems.value = response.data.data;
            } else if (Array.isArray(response.data)) {
                // 直接返回數組
                cartItems.value = response.data;
            } else {
                console.error("獲取購物車數據失敗: 響應格式不符合預期");
                console.log("完整響應:", response.data);
                cartItems.value = [];
                ElMessage.error("獲取購物車數據失敗，API響應格式不符");
            }
            fetchCartTotal();
        } else {
            cartItems.value = [];
            ElMessage.error("獲取購物車數據失敗，沒有收到響應數據");
        }
    } catch (error) {
        console.error("獲取購物車失敗:", error);
        if (error.response) {
            console.error("錯誤狀態:", error.response.status);
            console.error("錯誤數據:", error.response.data);
        }
        ElMessage.error("獲取購物車失敗，請稍後重試");
        cartItems.value = [];
    }
};

// 獲取購物車總金額
const fetchCartTotal = async () => {
    try {
        const response = await axios.get(`/api/cart/total`);
        console.log("獲取購物車總金額響應:", response.data);

        // 兼容多種響應格式
        if (response.data) {
            if (response.data.status === "success" && response.data.data) {
                // {status: "success", data: 數值}
                totalPrice.value = response.data.data;
            } else if (response.data.success && response.data.data) {
                // {success: true, data: 數值}
                totalPrice.value = response.data.data;
            } else if (typeof response.data === "number") {
                // 直接返回數值
                totalPrice.value = response.data;
            } else {
                console.error("獲取購物車總額失敗: 響應格式不符合預期");
                console.log("完整響應:", response.data);
                // 手動計算總額作為備用
                totalPrice.value = cartItems.value.reduce(
                    (total, item) => total + item.product.price * item.quantity,
                    0
                );
            }
        } else {
            // 手動計算總額作為備用
            totalPrice.value = cartItems.value.reduce(
                (total, item) => total + item.product.price * item.quantity,
                0
            );
        }
    } catch (error) {
        console.error("獲取購物車總額失敗:", error);
        if (error.response) {
            console.error("錯誤狀態:", error.response.status);
            console.error("錯誤數據:", error.response.data);
        }
        ElMessage.error("獲取購物車總額失敗");
        // 手動計算總額作為備用
        totalPrice.value = cartItems.value.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0
        );
    }
};

// 更新購物車商品數量
const handleQuantityChange = async (cartItemId, quantity) => {
    try {
        await axios.put(`/api/cart/items/${cartItemId}/quantity?quantity=${quantity}`);
        await fetchCartItems();
    } catch (error) {
        console.error("更新數量失敗:", error);
        ElMessage.error("更新數量失敗");
    }
};

// 從購物車移除商品
const handleRemove = async (cartItemId) => {
    try {
        await ElMessageBox.confirm("確定要從購物車中移除該商品嗎？", "提示", {
            type: "warning",
        });

        await axios.delete(`/api/cart/items/${cartItemId}`);
        ElMessage.success("商品已從購物車移除");
        await fetchCartItems();
    } catch (error) {
        if (error !== "cancel") {
            console.error("移除商品失敗:", error);
            ElMessage.error("移除商品失敗");
        }
    }
};

// 清空購物車
const clearCart = async () => {
    try {
        await ElMessageBox.confirm("確定要清空購物車嗎？", "提示", {
            type: "warning",
        });

        await axios.delete(`/api/cart/clear`);
        ElMessage.success("購物車已清空");
        await fetchCartItems();
    } catch (error) {
        if (error !== "cancel") {
            console.error("清空購物車失敗:", error);
            ElMessage.error("清空購物車失敗");
        }
    }
};

// 結算，創建訂單
const handleCheckout = async () => {
    try {
        const response = await axios.post(`/api/order/cart`);
        console.log("創建訂單響應:", response.data);

        // 兼容多種響應格式
        if (response.data) {
            if (
                (response.data.status === "success" && response.data.data) ||
                (response.data.success && response.data.data)
            ) {
                const orderId = response.data.data.id || response.data.data;
                ElMessage.success("訂單創建成功");
                router.push(`/shop/orders/${orderId}`);
            } else {
                console.error("創建訂單失敗: 響應格式不符合預期");
                console.log("完整響應:", response.data);
                ElMessage.error("創建訂單失敗，API響應格式不符");
            }
        } else {
            ElMessage.error("創建訂單失敗，沒有收到響應數據");
        }
    } catch (error) {
        console.error("創建訂單失敗:", error);
        if (error.response) {
            console.error("錯誤狀態:", error.response.status);
            console.error("錯誤數據:", error.response.data);
            const errorMessage =
                error.response.data?.message || error.response.statusText || "未知錯誤";
            ElMessage.error(`創建訂單失敗: ${errorMessage}`);
        } else {
            ElMessage.error("創建訂單失敗");
        }
    }
};

// 跳轉到商品列表頁
const goToProducts = () => {
    router.push("/shop/products");
};

onMounted(() => {
    fetchCartItems();
});
</script>

<style scoped>
.cart {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.empty-cart {
    text-align: center;
    padding: 40px;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.product-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
}

.cart-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
}

.total {
    font-size: 16px;
}

.price {
    color: #f56c6c;
    font-size: 20px;
    font-weight: bold;
}
</style>
