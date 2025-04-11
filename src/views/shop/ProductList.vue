<template>
    <div class="product-list-container">
        <el-card class="product-list-card">
            <template #header>
                <div class="product-list-header">
                    <h2>商品列表</h2>
                    <div class="filter-container">
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
                        
                        <el-select v-model="priceRange" placeholder="價格範圍" @change="handlePriceRangeChange">
                            <el-option 
                                v-for="item in priceRangeOptions" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                        
                        <el-button-group>
                            <el-button 
                                type="primary" 
                                :plain="viewMode !== 'grid'" 
                                icon="Grid" 
                                @click="viewMode = 'grid'">
                            </el-button>
                            <el-button 
                                type="primary" 
                                :plain="viewMode !== 'list'" 
                                icon="List" 
                                @click="viewMode = 'list'">
                            </el-button>
                        </el-button-group>
                    </div>
                </div>
            </template>
            
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="5" animated />
            </div>
            
            <!-- 网格视图 -->
            <div v-else-if="viewMode === 'grid'" class="grid-view">
                <el-row :gutter="20">
                    <el-col 
                        v-for="product in products" 
                        :key="product.id" 
                        :xs="24" 
                        :sm="12" 
                        :md="8" 
                        :lg="6"
                        class="product-col"
                    >
                        <el-card class="product-card" @click="goToProductDetail(product.id)">
                            <div class="product-image-container">
                                <el-image 
                                    :src="product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'" 
                                    fit="cover" 
                                    class="product-image"
                                />
                            </div>
                            <div class="product-info">
                                <h3 class="product-name">{{ product.name }}</h3>
                                <div class="product-price">${{ product.price }}</div>
                                <div class="product-action">
                                    <el-button type="primary" size="small" @click.stop="quickAddToCart(product)">
                                        加入購物車
                                    </el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            
            <!-- 列表视图 -->
            <div v-else class="list-view">
                <el-table :data="products" style="width: 100%" @row-click="row => goToProductDetail(row.id)">
                    <el-table-column label="商品圖片" width="100">
                        <template #default="{ row }">
                            <el-image 
                                :src="row.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'" 
                                fit="cover"
                                class="table-product-image"
                            />
                        </template>
                    </el-table-column>
                    
                    <el-table-column prop="name" label="商品名稱" min-width="180" />
                    
                    <el-table-column prop="price" label="價格" width="100">
                        <template #default="{ row }">
                            ${{ row.price }}
                        </template>
                    </el-table-column>
                    
                    <el-table-column prop="stockQuantity" label="庫存" width="80" />
                    
                    <el-table-column prop="description" label="描述" min-width="200">
                        <template #default="{ row }">
                            <el-tooltip 
                                :content="row.description" 
                                placement="top" 
                                :show-after="500"
                            >
                                <div class="description-ellipsis">{{ row.description }}</div>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    
                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                            <el-button 
                                type="primary" 
                                size="small" 
                                @click.stop="quickAddToCart(row)"
                            >
                                加入購物車
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            
            <!-- 空数据提示 -->
            <el-empty v-if="!loading && (!products || products.length === 0)" description="沒有找到符合條件的商品" />
            
            <!-- 分页 -->
            <div class="pagination-container" v-if="products.length > 0">
                <el-pagination
                    v-model:current-page="currentPage" 
                    v-model:page-size="pageSize"
                    :page-sizes="[12, 24, 36, 48]"
                    layout="total, sizes, prev, pager, next"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Grid, List, Search } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { getProducts, searchProducts, getProductsByPriceRange, addToCart as addProductToCart } from '@/api/shop';

const router = useRouter();
const authStore = useAuthStore();
const products = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const viewMode = ref('grid');
const searchKeyword = ref('');
const priceRange = ref('all');

const priceRangeOptions = [
    { label: '全部價格', value: 'all' },
    { label: '低價 < $100', value: 'low' },
    { label: '中價 $100-$500', value: 'medium' },
    { label: '高價 > $500', value: 'high' },
];

// 获取商品列表
const fetchProducts = async () => {
    loading.value = true;
    try {
        const response = await getProducts();
        products.value = response.data;
        total.value = response.data.length;
    } catch (error) {
        console.error('获取商品列表失败:', error);
        ElMessage.error('获取商品列表失败');
    } finally {
        loading.value = false;
    }
};

// 搜索商品
const handleSearch = async () => {
    if (!searchKeyword.value.trim()) {
        return fetchProducts();
    }
    
    loading.value = true;
    try {
        const response = await searchProducts(searchKeyword.value);
        products.value = response.data;
        total.value = response.data.length;
    } catch (error) {
        console.error('搜索商品失败:', error);
        ElMessage.error('搜索商品失败');
    } finally {
        loading.value = false;
    }
};

// 价格范围筛选
const handlePriceRangeChange = () => {
    if (priceRange.value === 'all') {
        fetchProducts();
        return;
    }
    
    let minPrice = 0;
    let maxPrice = 10000;
    
    switch (priceRange.value) {
        case 'low':
            maxPrice = 100;
            break;
        case 'medium':
            minPrice = 100;
            maxPrice = 500;
            break;
        case 'high':
            minPrice = 500;
            break;
    }
    
    filterByPriceRange(minPrice, maxPrice);
};

// 按价格范围筛选
const filterByPriceRange = async (minPrice, maxPrice) => {
    loading.value = true;
    try {
        const response = await getProductsByPriceRange(minPrice, maxPrice);
        products.value = response.data;
        total.value = response.data.length;
    } catch (error) {
        console.error('按价格筛选商品失败:', error);
        ElMessage.error('按价格筛选商品失败');
    } finally {
        loading.value = false;
    }
};

// 处理分页大小变化
const handleSizeChange = (val) => {
    pageSize.value = val;
    // 这里应该重新请求数据，但由于API不支持分页，所以只是模拟
};

// 处理当前页变化
const handleCurrentChange = (val) => {
    currentPage.value = val;
    // 这里应该重新请求数据，但由于API不支持分页，所以只是模拟
};

// 跳转到商品详情页
const goToProductDetail = (productId) => {
    router.push(`/shop/products/${productId}`);
};

// 快速加入购物车
const quickAddToCart = async (product) => {
    if (!authStore.isLoggedIn) {
        ElMessage.warning('請先登入');
        router.push('/member/login');
        return;
    }
    
    try {
        loading.value = true;
        const cartItem = {
            productId: product.id,
            quantity: 1
        };
        
        await addProductToCart(cartItem);
        ElMessage.success('已加入購物車');
    } catch (error) {
        console.error('加入購物車失敗:', error);
        ElMessage.error('加入購物車失敗');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchProducts();
});
</script>

<style scoped>
.product-list-container {
    padding: 20px;
}

.product-list-card {
    max-width: 1200px;
    margin: 0 auto;
}

.product-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filter-container {
    display: flex;
    gap: 15px;
    align-items: center;
}

.search-input {
    width: 250px;
}

.loading-container {
    padding: 20px;
}

.grid-view {
    margin-top: 20px;
}

.product-col {
    margin-bottom: 20px;
}

.product-card {
    cursor: pointer;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.product-image-container {
    height: 200px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info {
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.product-name {
    margin: 0 0 10px;
    font-size: 16px;
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.product-price {
    color: #f56c6c;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
}

.product-action {
    margin-top: auto;
    text-align: center;
}

.table-product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
}

.description-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

:deep(.el-table__row) {
    cursor: pointer;
}
</style> 