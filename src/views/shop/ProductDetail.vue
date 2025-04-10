<template>
    <div class="product-detail">
        <el-card class="detail-container">
            <template #header>
                <div class="detail-header">
                    <h2>商品詳情</h2>
                    <el-button @click="$router.back()">返回</el-button>
                </div>
            </template>

            <div v-if="loading" class="loading">
                <el-skeleton :rows="10" animated />
            </div>

            <div v-else-if="!product" class="not-found">
                <el-empty description="商品不存在">
                    <el-button type="primary" @click="$router.push('/shop/products')">
                        返回商品列表
                    </el-button>
                </el-empty>
            </div>

            <div v-else class="product-info">
                <el-row :gutter="20">
                    <el-col :span="10">
                        <div class="product-image-container">
                            <el-image
                                :src="product.imageUrl || 'https://via.placeholder.com/500'"
                                fit="contain"
                                class="main-image"
                            />
                        </div>
                    </el-col>

                    <el-col :span="14">
                        <div class="product-details">
                            <h1 class="product-name">{{ product.name }}</h1>
                            <div class="product-price">${{ product.price }}</div>

                            <div class="product-description">
                                <h3>商品描述</h3>
                                <p>{{ product.description }}</p>
                            </div>

                            <div class="product-actions">
                                <div class="quantity-select">
                                    <span class="quantity-label">數量:</span>
                                    <el-input-number
                                        v-model="quantity"
                                        :min="1"
                                        :max="product.stockQuantity"
                                        size="large"
                                    />
                                </div>

                                <div class="stock-info">
                                    <span>庫存: {{ product.stockQuantity }} 件</span>
                                </div>

                                <el-button
                                    type="primary"
                                    size="large"
                                    @click="addToCart"
                                    :disabled="product.stockQuantity <= 0"
                                >
                                    <el-icon><ShoppingCart /></el-icon> 加入購物車
                                </el-button>
                            </div>
                        </div>
                    </el-col>
                </el-row>

                <!-- 相關商品推薦 -->
                <div v-if="relatedProducts.length > 0" class="related-products">
                    <h3>相關商品推薦</h3>
                    <el-row :gutter="20">
                        <el-col
                            :xs="24"
                            :sm="12"
                            :md="8"
                            :lg="6"
                            v-for="item in relatedProducts"
                            :key="item.id"
                        >
                            <el-card
                                :body-style="{ padding: '0px' }"
                                shadow="hover"
                                class="related-product-card"
                                @click="goToProduct(item.id)"
                            >
                                <img
                                    :src="item.imageUrl || 'https://via.placeholder.com/150'"
                                    class="related-image"
                                />
                                <div class="related-info">
                                    <h4>{{ item.name }}</h4>
                                    <p class="related-price">${{ item.price }}</p>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <!-- 加入購物車成功提示 -->
            <el-dialog v-model="showSuccessDialog" title="成功" width="30%">
                <span>商品已成功加入購物車！</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="showSuccessDialog = false">繼續購物</el-button>
                        <el-button type="primary" @click="goToCart">查看購物車</el-button>
                    </span>
                </template>
            </el-dialog>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ShoppingCart } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const product = ref(null);
const relatedProducts = ref([]);
const quantity = ref(1);
const loading = ref(true);
const showSuccessDialog = ref(false);

// 獲取商品詳情
const fetchProductDetail = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`/api/products/${productId}`);
        if (response.data.status === "success") {
            product.value = response.data.data;
            // 設置默認數量
            quantity.value = 1;
            // 獲取相關商品
            fetchRelatedProducts();
        } else {
            ElMessage.error(response.data.message || "獲取商品詳情失敗");
        }
    } catch (error) {
        console.error("獲取商品詳情失敗:", error);
        ElMessage.error("獲取商品詳情失敗");
    } finally {
        loading.value = false;
    }
};

// 獲取相關商品
const fetchRelatedProducts = async () => {
    try {
        // 這裡可以根據實際API調整，可能是基於類別或推薦算法
        const response = await axios.get("/api/products", {
            params: {
                limit: 4,
                except: productId,
            },
        });

        if (response.data.status === "success") {
            // 過濾掉當前商品
            relatedProducts.value = response.data.data
                .filter((item) => item.id !== product.value.id)
                .slice(0, 4); // 限制數量
        }
    } catch (error) {
        console.error("獲取相關商品失敗:", error);
        // 不顯示錯誤提示，因為這不是關鍵功能
    }
};

// 添加到購物車
const addToCart = async () => {
    if (product.value.stockQuantity <= 0) {
        ElMessage.warning("商品庫存不足");
        return;
    }

    try {
        // 確保用戶已登錄
        const token = localStorage.getItem("authToken");
        if (!token) {
            ElMessage.error("請先登錄後再添加商品到購物車");
            router.push("/member/login"); // 導向登錄頁
            return;
        }

        // 精簡購物車添加請求
        const cartItemRequest = {
            productId: product.value.id,
            quantity: quantity.value || 1,
        };

        console.log("添加購物車請求:", cartItemRequest);

        const response = await axios.post(`/api/cart/items`, cartItemRequest, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("添加購物車響應:", response.data);

        // 簡化響應處理邏輯
        if (response.data && (response.data.success || response.data.status === "success")) {
            showSuccessDialog.value = true;
            ElMessage.success("商品已成功加入購物車！");
        } else {
            ElMessage.error("添加到購物車失敗");
        }
    } catch (error) {
        console.error("添加到購物車失敗:", error);

        // 詳細錯誤處理
        if (error.response) {
            console.error("錯誤狀態:", error.response.status);
            console.error("錯誤數據:", error.response.data);

            // 檢查是否為數據庫欄位錯誤
            if (
                error.response.data &&
                error.response.data.message &&
                error.response.data.message.includes("PreparedStatementCallback")
            ) {
                console.error("可能是數據庫欄位名稱錯誤！請檢查後端代碼與數據庫表結構是否一致");
                ElMessage.error("數據庫操作失敗，請聯繫管理員");
            } else if (error.response.status === 401) {
                ElMessage.error("請重新登錄後再添加商品到購物車");
                router.push("/member/login");
            } else {
                const errorMsg = error.response.data?.message || "未知錯誤";
                ElMessage.error(`添加到購物車失敗: ${errorMsg}`);
            }
        } else {
            ElMessage.error("添加到購物車失敗，請稍後重試");
        }
    }
};

// 跳轉到購物車
const goToCart = () => {
    router.push("/shop/cart");
    showSuccessDialog.value = false;
};

// 跳轉到其他商品
const goToProduct = (id) => {
    router.push(`/shop/products/${id}`);
};

onMounted(() => {
    fetchProductDetail();
});
</script>

<style scoped>
.product-detail {
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

.product-image-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.main-image {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
    border-radius: 8px;
}

.product-details {
    padding: 0 20px;
}

.product-name {
    font-size: 28px;
    margin-bottom: 20px;
}

.product-price {
    font-size: 32px;
    color: #f56c6c;
    font-weight: bold;
    margin-bottom: 20px;
}

.product-description {
    margin-bottom: 30px;
}

.product-description h3 {
    margin-bottom: 10px;
    font-size: 18px;
}

.product-description p {
    font-size: 16px;
    line-height: 1.6;
    color: #606266;
}

.product-actions {
    margin-top: 30px;
}

.quantity-select {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.quantity-label {
    margin-right: 10px;
    font-size: 16px;
}

.stock-info {
    margin-bottom: 20px;
    color: #606266;
}

.related-products {
    margin-top: 50px;
}

.related-products h3 {
    margin-bottom: 20px;
    font-size: 20px;
}

.related-product-card {
    cursor: pointer;
    transition: transform 0.3s;
    margin-bottom: 20px;
}

.related-product-card:hover {
    transform: translateY(-5px);
}

.related-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
}

.related-info {
    padding: 14px;
}

.related-info h4 {
    margin: 0;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.related-price {
    color: #f56c6c;
    font-weight: bold;
    margin-top: 8px;
}
</style>
