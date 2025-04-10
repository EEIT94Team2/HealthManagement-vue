<template>
    <div class="view-container">
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>

        <!-- 整合搜索和篩選區域 -->
        <div class="filter-container">
            <el-input v-model="searchKeyword" placeholder="輸入商品名稱搜索" class="search-input">
            </el-input>

            <el-button type="primary" @click="searchProducts">
                <el-icon><Search /></el-icon> 搜索
            </el-button>

            <!-- 管理按鈕 -->
            <el-button v-if="isAdmin" type="success" @click="showAddProductDialog = true">
                <el-icon><Plus /></el-icon> 新增商品
            </el-button>
        </div>

        <!-- 使用表格佈局來顯示商品 -->
        <el-table :data="paginatedProducts" style="width: 100%" border v-if="products.length > 0">
            <el-table-column prop="id" label="商品ID" width="80" />
            <el-table-column prop="name" label="商品名稱" min-width="150" />
            <el-table-column prop="description" label="描述" min-width="250" />
            <el-table-column prop="price" label="價格" width="100">
                <template #default="scope">
                    <span class="price">${{ scope.row.price }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="stockQuantity" label="庫存" width="80" />
            <el-table-column label="操作" width="180">
                <template #default="scope">
                    <el-button
                        v-if="isAdmin"
                        type="warning"
                        size="small"
                        @click="editProduct(scope.row)"
                    >
                        編輯
                    </el-button>
                    <el-button
                        v-if="isAdmin"
                        type="danger"
                        size="small"
                        @click="deleteProduct(scope.row.id)"
                    >
                        刪除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 無商品時顯示 -->
        <el-empty v-if="products.length === 0" description="沒有找到商品" />

        <!-- 新增/編輯商品對話框 -->
        <el-dialog
            v-model="showAddProductDialog"
            :title="editingProduct ? '編輯商品' : '新增商品'"
            width="50%"
        >
            <el-form :model="productForm" label-width="120px">
                <el-form-item label="商品名稱" required>
                    <el-input v-model="productForm.name" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="productForm.description" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item label="圖片URL">
                    <el-input v-model="productForm.imageUrl" placeholder="請輸入圖片URL地址" />
                </el-form-item>
                <el-form-item label="價格" required>
                    <el-input-number
                        v-model="productForm.price"
                        :min="0"
                        :step="1"
                        :precision="0"
                    />
                </el-form-item>
                <el-form-item label="庫存數量" required>
                    <el-input-number v-model="productForm.stockQuantity" :min="0" :step="1" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showAddProductDialog = false">取消</el-button>
                    <el-button type="primary" @click="saveProduct">確定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 刪除商品確認對話框 -->
        <el-dialog v-model="showDeleteConfirmDialog" title="確認刪除" width="30%">
            <span>確定要刪除此商品嗎？此操作不可逆。</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showDeleteConfirmDialog = false">取消</el-button>
                    <el-button type="danger" @click="confirmDeleteProduct">確定刪除</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 提示菜單順序信息 -->
        <el-alert
            v-if="isAdmin"
            title="菜單使用順序: 商品管理 → 購物車管理 → 訂單管理 → 模擬支付"
            type="info"
            description="請按照此順序操作系統，以確保流程正確"
            :closable="false"
            show-icon
            style="margin-top: 20px"
        />

        <!-- 添加分頁組件 -->
        <div class="pagination-container">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="products.length"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

const router = useRouter();
const pageTitle = ref("商品管理");
const pageDescription = ref("管理商品資訊");
const products = ref([]);
const searchKeyword = ref("");
const showAddProductDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const productToDeleteId = ref(null);
const isAdmin = ref(true); // 假設當前為管理員，實際應從用戶權限獲取
const editingProduct = ref(false);

// 商品表單
const productForm = ref({
    id: null,
    name: "",
    description: "",
    imageUrl: "",
    price: 0,
    stockQuantity: 0,
});

// 分頁相關的響應式變量
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 添加前端分頁計算
const paginatedProducts = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    return products.value.slice(startIndex, endIndex);
});

// 重置商品表單
const resetProductForm = () => {
    productForm.value = {
        id: null,
        name: "",
        description: "",
        imageUrl: "",
        price: 0,
        stockQuantity: 0,
    };
    editingProduct.value = false;
};

onMounted(() => {
    fetchProducts();
});

// 獲取所有商品
const fetchAllProducts = async () => {
    try {
        console.log("開始請求所有商品數據...");
        const response = await axios.get("/api/products");
        console.log("獲取商品數據響應:", response);

        // 檢查響應的數據結構
        if (response.data && response.data.success && response.data.data) {
            if (Array.isArray(response.data.data)) {
                products.value = response.data.data;
                console.log("成功處理商品數據，總數:", products.value.length);
                console.log(
                    "首個商品示例:",
                    products.value.length > 0 ? products.value[0] : "無商品"
                );
            } else {
                console.error("商品數據格式錯誤，期望陣列但收到:", typeof response.data.data);
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
        if (error.response) {
            console.error("錯誤狀態:", error.response.status);
            console.error("錯誤數據:", error.response.data);
        }
        products.value = [];
        ElMessage.error("獲取商品失敗，請稍後重試");
    }
};

// 修改獲取商品的方法
const fetchProducts = async () => {
    try {
        const response = await axios.get("/api/products");
        console.log("獲取商品響應:", response.data);

        if (response.data && (response.data.success || response.data.status === "success")) {
            const data = response.data.data || response.data;
            products.value = Array.isArray(data) ? data : [];
            total.value = products.value.length;

            // 重置到第一頁
            if (currentPage.value > 1 && paginatedProducts.value.length === 0) {
                currentPage.value = 1;
            }
        } else {
            throw new Error(response.data?.message || "獲取商品列表失敗");
        }
    } catch (error) {
        console.error("獲取商品列表失敗:", error);
        ElMessage.error(error.response?.data?.message || "獲取商品列表失敗，請稍後重試");
        products.value = [];
        total.value = 0;
    }
};

// 搜索商品
const searchProducts = async () => {
    try {
        let url = "/api/products";

        if (searchKeyword.value && searchKeyword.value.trim()) {
            url = `/api/products/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`;
        }

        const response = await axios.get(url);
        console.log("搜索結果響應:", response.data);

        if (response.data && (response.data.success || response.data.status === "success")) {
            const data = response.data.data || response.data;
            products.value = Array.isArray(data) ? data : [];
            total.value = products.value.length;
            currentPage.value = 1; // 重置到第一頁
        } else {
            throw new Error(response.data?.message || "搜索商品失敗");
        }
    } catch (error) {
        console.error("搜索商品失敗:", error);
        ElMessage.error(error.response?.data?.message || "搜索商品失敗，請稍後重試");
        products.value = [];
        total.value = 0;
    }
};

// 處理頁碼改變
const handleCurrentChange = (val) => {
    currentPage.value = val;
};

// 處理每頁顯示數量改變
const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
};

// 編輯商品
const editProduct = (product) => {
    editingProduct.value = true;
    productForm.value = { ...product };
    showAddProductDialog.value = true;
};

// 刪除商品
const deleteProduct = (productId) => {
    productToDeleteId.value = productId;
    showDeleteConfirmDialog.value = true;
};

// 確認刪除商品
const confirmDeleteProduct = async () => {
    try {
        if (!productToDeleteId.value) return;

        const response = await axios.delete(`/api/products/${productToDeleteId.value}`);

        if (response.data && response.data.success) {
            ElMessage.success("商品已成功刪除");
            fetchAllProducts(); // 重新加載商品列表
        } else {
            ElMessage.error(response.data.message || "刪除商品失敗");
        }
    } catch (error) {
        console.error("刪除商品失敗:", error);
        ElMessage.error("刪除商品失敗，請稍後重試");
    } finally {
        showDeleteConfirmDialog.value = false;
        productToDeleteId.value = null;
    }
};

// 保存商品（新增或更新）
const saveProduct = async () => {
    try {
        if (!productForm.value.name || productForm.value.price === undefined) {
            return ElMessage.warning("請填寫必要欄位");
        }

        let response;
        if (editingProduct.value && productForm.value.id) {
            // 更新商品
            response = await axios.put(`/api/products/${productForm.value.id}`, productForm.value);
        } else {
            // 新增商品
            response = await axios.post("/api/products", productForm.value);
        }

        if (response.data && response.data.success) {
            ElMessage.success(editingProduct.value ? "商品已成功更新" : "商品已成功新增");
            showAddProductDialog.value = false;
            resetProductForm();
            fetchAllProducts(); // 重新加載商品列表
        } else {
            ElMessage.error(
                response.data.message || (editingProduct.value ? "更新商品失敗" : "新增商品失敗")
            );
        }
    } catch (error) {
        console.error(editingProduct.value ? "更新商品失敗:" : "新增商品失敗:", error);
        ElMessage.error(
            editingProduct.value ? "更新商品失敗，請稍後重試" : "新增商品失敗，請稍後重試"
        );
    }
};
</script>

<style scoped>
.view-container {
    padding: 20px;
}
h1 {
    margin-bottom: 15px;
}
.filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
    align-items: center;
}
.search-input {
    width: 300px;
}
.price-filter {
    display: flex;
    align-items: center;
    gap: 10px;
}
.price {
    color: #ff6b6b;
    font-weight: bold;
}
.el-table {
    margin-bottom: 20px;
}
.info-icon {
    color: #909399;
    cursor: pointer;
    margin-left: 5px;
}
.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
</style>
