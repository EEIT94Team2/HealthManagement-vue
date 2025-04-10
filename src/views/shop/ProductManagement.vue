<template>
    <div class="product-management">
        <el-card class="management-container">
            <template #header>
                <div class="management-header">
                    <h2>商品管理</h2>
                    <el-button type="primary" @click="showAddDialog">新增商品</el-button>
                </div>
            </template>

            <el-table :data="products" style="width: 100%">
                <el-table-column label="商品圖片" width="120">
                    <template #default="{ row }">
                        <el-image :src="row.imageUrl" fit="cover" class="product-image" />
                    </template>
                </el-table-column>

                <el-table-column prop="name" label="商品名稱" min-width="200" />

                <el-table-column prop="price" label="價格" width="120">
                    <template #default="{ row }"> ${{ row.price }} </template>
                </el-table-column>

                <el-table-column prop="stockQuantity" label="庫存" width="120" />

                <el-table-column label="狀態" width="120">
                    <template #default="{ row }">
                        <el-tag :type="row.enabled ? 'success' : 'info'">
                            {{ row.enabled ? "上架中" : "已下架" }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button-group>
                            <el-button type="primary" :icon="Edit" @click="showEditDialog(row)">
                                編輯
                            </el-button>
                            <el-button type="danger" :icon="Delete" @click="handleDelete(row)">
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

                <el-form-item label="商品狀態" prop="enabled">
                    <el-switch
                        v-model="form.enabled"
                        :active-text="'上架'"
                        :inactive-text="'下架'"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit"> 確定 </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Edit, Delete, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

const products = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);

const form = ref({
    name: "",
    price: 0,
    stockQuantity: 0,
    description: "",
    imageUrl: "",
    enabled: true,
});

const rules = {
    name: [{ required: true, message: "請輸入商品名稱", trigger: "blur" }],
    price: [{ required: true, message: "請輸入商品價格", trigger: "blur" }],
    stockQuantity: [{ required: true, message: "請輸入商品庫存", trigger: "blur" }],
    description: [{ required: true, message: "請輸入商品描述", trigger: "blur" }],
    imageUrl: [{ required: true, message: "請上傳商品圖片", trigger: "change" }],
};

// 獲取商品列表
const fetchProducts = async () => {
    try {
        // 對接後端API
        const response = await axios.get("/api/products");
        if (response.data.status === "success") {
            products.value = response.data.data;
            total.value = response.data.data.length; // 如果API未提供總數，則使用當前數組長度
        } else {
            ElMessage.error(response.data.message || "獲取商品列表失敗");
        }
    } catch (error) {
        console.error("獲取商品列表失敗:", error);
        ElMessage.error("獲取商品列表失敗");
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
    isEdit.value = false;
    form.value = {
        name: "",
        price: 0,
        stockQuantity: 0,
        description: "",
        imageUrl: "",
        enabled: true,
    };
    dialogVisible.value = true;
};

// 顯示編輯對話框
const showEditDialog = (row) => {
    isEdit.value = true;
    form.value = { ...row };
    dialogVisible.value = true;
};

// 處理刪除
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm("確定要刪除此商品嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning",
        });

        await axios.delete(`/api/products/${row.id}`);
        ElMessage.success("刪除成功");
        fetchProducts();
    } catch (error) {
        if (error !== "cancel") {
            ElMessage.error("刪除失敗");
        }
    }
};

// 處理表單提交
const handleSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                let response;
                if (isEdit.value) {
                    response = await axios.put(`/api/products/${form.value.id}`, form.value);
                } else {
                    response = await axios.post("/api/products", form.value);
                }

                if (response.data.status === "success") {
                    ElMessage.success(isEdit.value ? "更新成功" : "新增成功");
                    dialogVisible.value = false;
                    fetchProducts();
                } else {
                    ElMessage.error(
                        response.data.message || (isEdit.value ? "更新失敗" : "新增失敗")
                    );
                }
            } catch (error) {
                console.error(isEdit.value ? "更新失敗" : "新增失敗", error);
                ElMessage.error(isEdit.value ? "更新失敗" : "新增失敗");
            }
        }
    });
};

// 上傳前驗證
const beforeUpload = (file) => {
    ElMessage.warning("當前系統暫不支持圖片上傳，請直接輸入圖片URL");
    return false; // 阻止上傳
};

// 上傳成功回調 - 由於沒有上傳API，此函數可能不會被調用
const handleUploadSuccess = (response) => {
    ElMessage.warning("當前系統暫不支持圖片上傳，請直接輸入圖片URL");
    /* 
    if (response.status === 'success') {
        form.value.imageUrl = response.data.url;
        ElMessage.success("上傳成功");
    } else {
        ElMessage.error(response.message || "上傳失敗");
    }
    */
};

onMounted(fetchProducts);
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

.product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
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
</style>
