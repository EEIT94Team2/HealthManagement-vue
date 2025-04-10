<template>
    <div class="view-container">
        <h1>購物車管理</h1>

        <!-- 購物車內容區塊 - 移到頁面上方 -->
        <div class="section-container cart-section">
            <h2>購物車內容</h2>

            <div class="cart-header" v-if="cartItems.length > 0">
                <el-button type="danger" size="small" @click="clearCart">
                    <el-icon><Delete /></el-icon> 清空購物車
                </el-button>
            </div>

            <el-table
                :data="paginatedCartItems"
                style="width: 100%"
                border
                v-if="cartItems.length > 0"
            >
                <el-table-column prop="product.name" label="商品名稱" min-width="120" />
                <el-table-column prop="product.description" label="商品簡介" min-width="200">
                    <template #default="scope">
                        <div class="description-cell">{{ scope.row.product.description }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="product.price" label="單價" width="100">
                    <template #default="scope">
                        <span class="price">${{ scope.row.product.price }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="數量" width="150">
                    <template #default="scope">
                        <el-input-number
                            v-model="scope.row.quantity"
                            :min="1"
                            size="small"
                            @change="updateCartItemQuantity(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="小計" width="120">
                    <template #default="scope">
                        <span class="price">
                            ${{ calculateSubtotal(scope.row.product.price, scope.row.quantity) }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template #default="scope">
                        <el-button type="danger" size="small" @click="removeFromCart(scope.row.id)">
                            <el-icon><Delete /></el-icon> 刪除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 購物車分頁 -->
            <el-pagination
                v-if="cartItems.length > cartPageSize"
                v-model:current-page="cartCurrentPage"
                v-model:page-size="cartPageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="cartItems.length"
                @size-change="handleCartSizeChange"
                @current-change="handleCartCurrentChange"
                style="margin-top: 20px; justify-content: center"
            />

            <el-empty v-if="cartItems.length === 0" description="購物車為空" :image-size="200">
                <span class="empty-cart-tip">您可以從下方商品列表選擇商品添加到購物車</span>
            </el-empty>

            <div class="cart-summary" v-if="cartItems.length > 0">
                <div class="total">
                    <span>總計: </span>
                    <span class="price">${{ calculateTotal() }}</span>
                </div>
                <el-button type="success" @click="checkout">結帳</el-button>
            </div>
        </div>

        <!-- 商品列表區塊 - 移到頁面下方 -->
        <div class="section-container">
            <h2>商品列表</h2>
            <div class="filter-container">
                <el-input
                    v-model="searchKeyword"
                    placeholder="輸入商品名稱搜索"
                    class="search-input"
                >
                </el-input>
                <el-button type="primary" @click="searchProducts">
                    <el-icon><Search /></el-icon> 搜索
                </el-button>
            </div>

            <!-- 商品列表 -->
            <el-table
                :data="paginatedProducts"
                style="width: 100%"
                border
                v-if="products.length > 0"
            >
                <el-table-column prop="id" label="商品ID" width="80" />
                <el-table-column prop="name" label="商品名稱" min-width="120" />
                <el-table-column prop="description" label="商品簡介" min-width="200">
                    <template #default="scope">
                        <div class="description-cell">{{ scope.row.description }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="單價" width="100">
                    <template #default="scope">
                        <span class="price">${{ scope.row.price }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="stockQuantity" label="庫存" width="80" />
                <el-table-column label="數量" width="150">
                    <template #default="scope">
                        <el-input-number
                            v-model="scope.row.quantity"
                            :min="1"
                            :max="scope.row.stockQuantity || 99"
                            size="small"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template #default="scope">
                        <el-button
                            type="primary"
                            size="small"
                            @click="addToCart(scope.row)"
                            :disabled="!scope.row.stockQuantity"
                        >
                            <el-icon><Plus /></el-icon> 加入購物車
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 商品分頁 -->
            <el-pagination
                v-if="products.length > productPageSize"
                v-model:current-page="productCurrentPage"
                v-model:page-size="productPageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="products.length"
                @size-change="handleProductSizeChange"
                @current-change="handleProductCurrentChange"
                style="margin-top: 20px; justify-content: center"
            />

            <el-empty v-if="products.length === 0" description="沒有找到商品" />
        </div>

        <!-- 加入購物車成功提示 -->
        <el-dialog v-model="showSuccessDialog" title="成功" width="30%">
            <span>商品已成功加入購物車！</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showSuccessDialog = false">繼續購物</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

const router = useRouter();
const products = ref([]);
const cartItems = ref([]);
const searchKeyword = ref("");
const showSuccessDialog = ref(false);

// 購物車分頁
const cartCurrentPage = ref(1);
const cartPageSize = ref(5);

// 商品分頁
const productCurrentPage = ref(1);
const productPageSize = ref(10);

onMounted(() => {
    fetchAllProducts();
    fetchCartItems();
});

// 獲取所有商品
const fetchAllProducts = async () => {
    try {
        console.log("開始請求所有商品數據...");
        const response = await axios.get("/api/products");
        console.log("獲取商品數據響應:", response);

        // 兼容兩種響應格式 (success: true 或 status: "success")
        if (
            (response.data && response.data.success) ||
            (response.data && response.data.status === "success")
        ) {
            const responseData = response.data.data || response.data;
            if (Array.isArray(responseData)) {
                products.value = responseData.map((product) => ({
                    ...product,
                    quantity: 1,
                }));
                console.log("成功處理商品數據，總數:", products.value.length);
            } else {
                console.error("商品數據格式錯誤，期望陣列但收到:", typeof responseData);
                products.value = [];
                ElMessage.error("獲取商品數據格式錯誤");
            }
        } else {
            console.error("獲取商品失敗: 響應格式不符合預期");
            console.log("完整響應:", response.data);
            products.value = [];
            ElMessage.error("獲取商品失敗，API響應格式不符");
        }
    } catch (error) {
        console.error("獲取商品失敗:", error);
        products.value = [];
        ElMessage.error("獲取商品失敗，請稍後重試");
    }
};

// 整合搜索功能（名稱+價格範圍）
const searchProducts = async () => {
    try {
        // 構建查詢參數
        let url = "/api/products";

        // 構建查詢參數
        const params = new URLSearchParams();

        if (searchKeyword.value && searchKeyword.value.trim()) {
            params.append("keyword", searchKeyword.value.trim());
        }

        // 如果添加了搜索參數，使用 search 路徑
        if (params.toString()) {
            url = `/api/products/search?${params.toString()}`;
        }

        console.log("搜索URL:", url);
        const response = await axios.get(url);
        console.log("搜索結果響應:", response);

        // 兼容兩種響應格式
        if (
            (response.data && response.data.success) ||
            (response.data && response.data.status === "success")
        ) {
            const responseData = response.data.data || response.data;
            if (Array.isArray(responseData)) {
                products.value = responseData.map((product) => ({
                    ...product,
                    quantity: 1,
                }));
                console.log(`搜索成功，找到${products.value.length}個商品`);
            } else {
                console.error("搜索商品失敗: 響應格式不符合預期");
                console.log("完整響應:", response.data);
                products.value = [];
                ElMessage.error("搜索商品失敗，API響應格式不符");
            }
        } else {
            console.error("搜索商品失敗: 響應格式不符合預期");
            console.log("完整響應:", response.data);
            products.value = [];
            ElMessage.error("搜索商品失敗，API響應格式不符");
        }
    } catch (error) {
        console.error("搜索商品失敗:", error);
        if (error.response) {
            console.error("錯誤狀態:", error.response.status);
            console.error("錯誤數據:", error.response.data);
        }
        products.value = [];
        ElMessage.error("搜索商品失敗，請稍後重試");
    }
};

// 獲取購物車內容
const fetchCartItems = async () => {
    try {
        console.log("開始請求購物車數據...");
        // 確保發送token
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.warn("未找到登錄token");
            cartItems.value = [];
            return;
        }

        // 從localStorage獲取當前用戶ID
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const userId = userData.userId || 21; // 默認使用ID 21

        // 使用查詢參數傳遞用戶ID
        const response = await axios.get(`/api/cart/items?userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("獲取購物車數據響應:", response);

        // 兼容兩種響應格式
        if (
            (response.data && response.data.success) ||
            (response.data && response.data.status === "success")
        ) {
            const responseData = response.data.data || response.data;
            if (Array.isArray(responseData)) {
                cartItems.value = responseData;
                console.log("成功處理購物車數據，總數:", cartItems.value.length);
            } else {
                console.error("購物車數據格式錯誤，期望陣列但收到:", typeof responseData);
                cartItems.value = [];
                ElMessage.error("獲取購物車數據格式錯誤");
            }
        } else {
            console.error("獲取購物車失敗: 響應格式不符合預期");
            cartItems.value = [];
            ElMessage.error("獲取購物車失敗，API響應格式不符");
        }
    } catch (error) {
        console.error("獲取購物車失敗:", error);
        cartItems.value = [];
        ElMessage.error("獲取購物車失敗，請稍後重試");
    }
};

// 添加商品到購物車
const addToCart = async (product) => {
    try {
        if (!product.stockQuantity || product.stockQuantity <= 0) {
            ElMessage.warning("該商品庫存不足");
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            ElMessage.error("請先登錄後再添加商品到購物車");
            router.push("/member/login");
            return;
        }

        // 從localStorage獲取當前用戶ID
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const userId = userData.userId || 21; // 默認使用ID 21

        // 修改請求數據格式
        const cartItemRequest = {
            productId: product.id,
            quantity: product.quantity || 1,
        };

        console.log("添加購物車請求數據:", cartItemRequest, "用戶ID:", userId);

        // 使用查詢參數傳遞用戶ID
        const response = await axios.post(`/api/cart/items?userId=${userId}`, cartItemRequest, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data && (response.data.success || response.data.status === "success")) {
            showSuccessDialog.value = true;
            ElMessage.success("商品已成功加入購物車！");
            await fetchCartItems();
        } else {
            throw new Error(response.data?.message || "添加失敗");
        }
    } catch (error) {
        console.error("添加到購物車失敗:", error);
        if (error.response?.status === 400) {
            ElMessage.error("請檢查輸入的數據格式是否正確");
        } else {
            ElMessage.error(error.response?.data?.message || "添加到購物車失敗，請稍後重試");
        }
    }
};

// 更新購物車商品數量
const updateCartItemQuantity = async (cartItem) => {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            ElMessage.error("請先登錄");
            return;
        }

        // 從localStorage獲取當前用戶ID
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const userId = userData.userId || 21; // 默認使用ID 21

        const response = await axios.put(
            `/api/cart/items/${cartItem.id}?userId=${userId}`,
            {
                productId: cartItem.product.id,
                quantity: cartItem.quantity,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data && (response.data.success || response.data.status === "success")) {
            ElMessage.success("數量已更新");
            await fetchCartItems();
        } else {
            throw new Error(response.data?.message || "更新失敗");
        }
    } catch (error) {
        console.error("更新購物車數量失敗:", error);
        ElMessage.error("更新數量失敗，請稍後重試");
        await fetchCartItems();
    }
};

// 從購物車中移除商品
const removeFromCart = async (cartItemId) => {
    try {
        console.log(`嘗試從購物車移除商品，ID:`, cartItemId);

        const token = localStorage.getItem("authToken");
        if (!token) {
            ElMessage.error("請先登錄");
            return;
        }

        // 從localStorage獲取當前用戶ID
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const userId = userData.userId || 21; // 默認使用ID 21

        const response = await axios.delete(`/api/cart/items/${cartItemId}?userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // 兼容兩種響應格式
        if (
            (response.data && response.data.success) ||
            (response.data && response.data.status === "success")
        ) {
            ElMessage.success("商品已從購物車移除");
            fetchCartItems(); // 重新獲取購物車內容
        } else {
            console.error("移除商品失敗: 響應格式不符合預期");
            ElMessage.error(response.data?.message || "移除商品失敗");
        }
    } catch (error) {
        console.error("移除購物車商品失敗:", error);
        ElMessage.error("移除商品失敗，請稍後重試");
    }
};

// 計算小計
const calculateSubtotal = (price, quantity) => {
    return (price * quantity).toFixed(2);
};

// 計算總計
const calculateTotal = () => {
    let total = 0;
    cartItems.value.forEach((item) => {
        total += item.product.price * item.quantity;
    });
    return total.toFixed(2);
};

// 結帳
const checkout = () => {
    if (cartItems.value.length === 0) {
        return ElMessage.warning("購物車為空，無法結帳");
    }
    router.push("/shop/checkout");
};

// 清空購物車
const clearCart = async () => {
    try {
        await ElMessageBox.confirm("確定要清空購物車嗎？", "提示", {
            type: "warning",
        });

        const token = localStorage.getItem("authToken");
        if (!token) {
            ElMessage.error("請先登錄");
            return;
        }

        // 從localStorage獲取當前用戶ID
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const userId = userData.userId || 21; // 默認使用ID 21

        const response = await axios.delete(`/api/cart/clear?userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // 兼容兩種響應格式
        if (
            (response.data && response.data.success) ||
            (response.data && response.data.status === "success")
        ) {
            ElMessage.success("購物車已清空");
            fetchCartItems(); // 重新獲取購物車內容
        } else {
            console.error("清空購物車失敗: 響應格式不符合預期");
            ElMessage.error(response.data?.message || "清空購物車失敗");
        }
    } catch (error) {
        if (error !== "cancel") {
            console.error("清空購物車失敗:", error);
            ElMessage.error("清空購物車失敗");
        }
    }
};

// 分頁後的購物車數據
const paginatedCartItems = computed(() => {
    const start = (cartCurrentPage.value - 1) * cartPageSize.value;
    const end = start + cartPageSize.value;
    return cartItems.value.slice(start, end);
});

// 分頁後的商品數據
const paginatedProducts = computed(() => {
    const start = (productCurrentPage.value - 1) * productPageSize.value;
    const end = start + productPageSize.value;
    return products.value.slice(start, end);
});

// 購物車分頁處理
const handleCartSizeChange = (size) => {
    cartPageSize.value = size;
    cartCurrentPage.value = 1;
};

const handleCartCurrentChange = (page) => {
    cartCurrentPage.value = page;
};

// 商品分頁處理
const handleProductSizeChange = (size) => {
    productPageSize.value = size;
    productCurrentPage.value = 1;
};

const handleProductCurrentChange = (page) => {
    productCurrentPage.value = page;
};
</script>

<style scoped>
.view-container {
    padding: 20px;
}
h1,
h2 {
    margin-bottom: 15px;
}
.section-container {
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
}
.cart-section {
    background-color: #eef1f6;
}
.filter-container {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    align-items: center;
}
.search-input {
    width: 300px;
}
.price {
    color: #ff6b6b;
    font-weight: bold;
}
.cart-summary {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 20px;
    gap: 20px;
}
.total {
    font-size: 18px;
    font-weight: bold;
}
.el-table {
    margin-bottom: 20px;
}
.cart-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}
.empty-cart-tip {
    color: #909399;
    font-size: 14px;
    text-align: center;
}
.description-cell {
    white-space: normal;
    word-break: break-word;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>
