<template>
    <div class="product-management">
        <el-card class="management-container">
            <template #header>
                <div class="management-header">
                    <h2>商品管理</h2>
                    <div class="search-actions">
                        <el-input 
                            v-model="searchKeyword" 
                            placeholder="搜索商品" 
                            class="search-input"
                            clearable 
                            @keyup.enter="handleSearch"
                        >
                            <template #append>
                                <el-button icon="Search" @click="handleSearch"></el-button>
                            </template>
                        </el-input>
                        
                        <el-dropdown @command="handleFilterCommand" class="price-filter">
                            <el-button>
                                價格篩選 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="all">全部商品</el-dropdown-item>
                                    <el-dropdown-item command="low">低價 (< $100)</el-dropdown-item>
                                    <el-dropdown-item command="medium">中價 ($100 - $500)</el-dropdown-item>
                                    <el-dropdown-item command="high">高價 (> $500)</el-dropdown-item>
                                    <el-dropdown-item command="custom">自定義價格</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        
                        <el-button type="primary" @click="showAddDialog">新增商品</el-button>
                    </div>
                </div>
            </template>

            <el-table v-loading="loading" :data="products" style="width: 100%">
                <el-table-column label="商品圖片" width="120">
                    <template #default="{ row }">
                        <el-image 
                            :src="row.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'" 
                            fit="cover" 
                            class="product-image"
                            :preview-src-list="[row.imageUrl]"
                        />
                    </template>
                </el-table-column>

                <el-table-column prop="name" label="商品名稱" min-width="180" />

                <el-table-column prop="price" label="價格" width="120">
                    <template #default="{ row }"> ${{ row.price }} </template>
                </el-table-column>

                <el-table-column prop="stockQuantity" label="庫存" width="120" />
                
                <el-table-column label="描述" min-width="220">
                    <template #default="{ row }">
                        <el-tooltip 
                            :content="row.description" 
                            placement="top" 
                            :show-after="500"
                            effect="light"
                            max-width="300"
                        >
                            <div class="description-text">{{ row.description }}</div>
                        </el-tooltip>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                        <el-button-group>
                            <el-button type="primary" size="small" @click="showEditDialog(row)">
                                編輯
                            </el-button>
                            <el-button type="danger" size="small" @click="handleDelete(row)">
                                刪除
                            </el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :total="total"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 新增/編輯商品對話框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '編輯商品' : '新增商品'" width="500px">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="商品名稱" prop="name">
                    <el-input v-model="form.name" />
                </el-form-item>

                <el-form-item label="商品價格" prop="price">
                    <el-input-number
                        v-model="form.price"
                        :min="0"
                        :precision="2"
                        style="width: 100%"
                    />
                </el-form-item>

                <el-form-item label="商品庫存" prop="stockQuantity">
                    <el-input-number v-model="form.stockQuantity" :min="0" style="width: 100%" />
                </el-form-item>

                <el-form-item label="商品描述" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="4" />
                </el-form-item>

                <el-form-item label="商品圖片" prop="imageUrl">
                    <el-upload
                        class="image-upload"
                        action="/api/upload"
                        :show-file-list="false"
                        :on-success="handleUploadSuccess"
                        :before-upload="beforeUpload"
                        :auto-upload="false"
                    >
                        <img v-if="form.imageUrl" :src="form.imageUrl" class="preview-image" />
                        <div v-else>
                            <el-icon class="upload-icon"><Plus /></el-icon>
                            <div class="el-upload__text">上傳圖片或輸入URL</div>
                        </div>
                    </el-upload>
                    <el-input
                        v-model="form.imageUrl"
                        placeholder="或直接輸入圖片URL"
                        class="mt-10"
                    />
                    <div class="el-upload__tip">注意：由於暫無圖片上傳API，請直接輸入圖片URL</div>
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit"> 確定 </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 自定義價格範圍對話框 -->
        <el-dialog v-model="priceRangeDialogVisible" title="自定義價格範圍" width="400px">
            <el-form :model="priceRangeForm">
                <el-form-item label="最低價格">
                    <el-input-number v-model="priceRangeForm.minPrice" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
                <el-form-item label="最高價格">
                    <el-input-number v-model="priceRangeForm.maxPrice" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="priceRangeDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handlePriceRangeFilter">篩選</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Edit, Delete, Plus, ArrowDown, Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    searchProducts,
    getProductsByPriceRange 
} from "@/api/shop";

const authStore = useAuthStore();
const products = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const loading = ref(false);
const searchKeyword = ref("");
const priceRangeDialogVisible = ref(false);
const priceRangeForm = ref({
    minPrice: 0,
    maxPrice: 1000
});

const form = ref({
    name: "",
    price: 0,
    stockQuantity: 0,
    description: "",
    imageUrl: "",
});

const rules = {
    name: [{ required: true, message: "請輸入商品名稱", trigger: "blur" }],
    price: [{ required: true, message: "請輸入商品價格", trigger: "blur" }],
    stockQuantity: [{ required: true, message: "請輸入商品庫存", trigger: "blur" }],
    description: [{ required: true, message: "請輸入商品描述", trigger: "blur" }],
    imageUrl: [{ required: true, message: "請輸入商品圖片URL", trigger: "blur" }],
};

// 檢查是否有管理員權限
const checkAdminPermission = () => {
    if (authStore.userRole !== 'admin') {
        ElMessage.error('只有管理員才能管理商品');
        return false;
    }
    return true;
};

// 獲取商品列表
const fetchProducts = async () => {
    if (!checkAdminPermission()) return;
    
    loading.value = true;
    try {
        const response = await getProducts();
        products.value = response.data;
        total.value = response.data.length;
    } catch (error) {
        console.error("獲取商品列表失敗:", error);
        ElMessage.error("獲取商品列表失敗");
    } finally {
        loading.value = false;
    }
};

// 處理搜索
const handleSearch = async () => {
    if (!checkAdminPermission()) return;
    
    if (!searchKeyword.value.trim()) {
        return fetchProducts();
    }
    
    loading.value = true;
    try {
        const response = await searchProducts(searchKeyword.value);
        products.value = response.data;
        total.value = response.data.length;
    } catch (error) {
        console.error("搜索商品失敗:", error);
        ElMessage.error("搜索商品失敗");
    } finally {
        loading.value = false;
    }
};

// 處理價格篩選
const handleFilterCommand = (command) => {
    if (command === 'custom') {
        priceRangeDialogVisible.value = true;
        return;
    }
    
    switch(command) {
        case 'all':
            fetchProducts();
            break;
        case 'low':
            filterByPriceRange(0, 100);
            break;
        case 'medium':
            filterByPriceRange(100, 500);
            break;
        case 'high':
            filterByPriceRange(500, 100000);
            break;
    }
};

// 自定義價格範圍篩選
const handlePriceRangeFilter = () => {
    filterByPriceRange(priceRangeForm.value.minPrice, priceRangeForm.value.maxPrice);
    priceRangeDialogVisible.value = false;
};

// 按價格範圍過濾
const filterByPriceRange = async (minPrice, maxPrice) => {
    if (!checkAdminPermission()) return;
    
    loading.value = true;
    try {
        const response = await getProductsByPriceRange(minPrice, maxPrice);
        products.value = response.data;
        total.value = response.data.length;
    } catch (error) {
        console.error("按價格過濾商品失敗:", error);
        ElMessage.error("按價格過濾商品失敗");
    } finally {
        loading.value = false;
    }
};

// 處理分頁大小變化
const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchProducts();
};

// 處理頁碼變化
const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchProducts();
};

// 顯示新增對話框
const showAddDialog = () => {
    if (!checkAdminPermission()) return;
    
    isEdit.value = false;
    form.value = {
        name: "",
        price: 0,
        stockQuantity: 0,
        description: "",
        imageUrl: "",
    };
    dialogVisible.value = true;
};

// 顯示編輯對話框
const showEditDialog = (row) => {
    if (!checkAdminPermission()) return;
    
    isEdit.value = true;
    form.value = { ...row };
    dialogVisible.value = true;
};

// 處理刪除
const handleDelete = async (row) => {
    if (!checkAdminPermission()) return;
    
    try {
        await ElMessageBox.confirm("確定要刪除此商品嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning",
        });

        loading.value = true;
        await deleteProduct(row.id);
        ElMessage.success("刪除成功");
        fetchProducts();
    } catch (error) {
        if (error !== "cancel") {
            console.error("刪除失敗:", error);
            ElMessage.error("刪除失敗");
        }
    } finally {
        loading.value = false;
    }
};

// 處理表單提交
const handleSubmit = async () => {
    if (!checkAdminPermission()) return;
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true;
                let response;
                if (isEdit.value) {
                    response = await updateProduct(form.value.id, form.value);
                    ElMessage.success("更新成功");
                } else {
                    response = await createProduct(form.value);
                    ElMessage.success("新增成功");
                }
                dialogVisible.value = false;
                fetchProducts();
            } catch (error) {
                console.error(isEdit.value ? "更新失敗" : "新增失敗", error);
                ElMessage.error(isEdit.value ? "更新失敗" : "新增失敗");
            } finally {
                loading.value = false;
            }
        }
    });
};

// 上傳前驗證
const beforeUpload = (file) => {
    ElMessage.warning("當前系統暫不支持圖片上傳，請直接輸入圖片URL");
    return false; // 阻止上傳
};

// 上傳成功回調
const handleUploadSuccess = (response) => {
    ElMessage.warning("當前系統暫不支持圖片上傳，請直接輸入圖片URL");
};

onMounted(() => {
    fetchProducts();
});
</script>

<style scoped>
.product-management {
    padding: 20px;
}

.management-container {
    max-width: 1200px;
    margin: 0 auto;
}

.management-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.search-input {
    width: 250px;
}

.price-filter {
    margin-right: 10px;
}

.product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
}

.description-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 220px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.image-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 148px;
    height: 148px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.image-upload:hover {
    border-color: #409eff;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.upload-icon {
    font-size: 28px;
    color: #8c939d;
}

:deep(.el-upload) {
    width: 100%;
    height: 100%;
}

.mt-10 {
    margin-top: 10px;
}
</style>
