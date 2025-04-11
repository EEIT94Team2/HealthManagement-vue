<template>
  <div class="cart-management">
    <el-card class="cart-container">
      <template #header>
        <div class="cart-header">
          <h2>我的購物車</h2>
        </div>
      </template>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <el-empty description="購物車是空的">
          <el-button type="primary" @click="$router.push('/shop/products')">去購物</el-button>
        </el-empty>
      </div>
      
      <div v-else class="cart-content">
        <el-table :data="cartItems" style="width: 100%">
          <el-table-column label="商品圖片" width="100">
            <template #default="{ row }">
              <el-image 
                :src="row.product.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'" 
                fit="cover"
                class="cart-product-image"
                @click="$router.push(`/shop/products/${row.product.id}`)"
              />
            </template>
          </el-table-column>
          
          <el-table-column prop="product.name" label="商品名稱" min-width="200">
            <template #default="{ row }">
              <div class="product-name" @click="$router.push(`/shop/products/${row.product.id}`)">
                {{ row.product.name }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="product.price" label="單價" width="120">
            <template #default="{ row }">
              ${{ row.product.price }}
            </template>
          </el-table-column>
          
          <el-table-column label="數量" width="150">
            <template #default="{ row }">
              <el-input-number 
                v-model="row.quantity" 
                :min="1" 
                :max="row.product.stockQuantity" 
                size="small"
                @change="(value) => updateQuantity(row.id, value)"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="小計" width="120">
            <template #default="{ row }">
              ${{ (row.product.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="danger" 
                icon="Delete" 
                circle
                size="small"
                @click="removeFromCart(row.id)"
              />
            </template>
          </el-table-column>
        </el-table>
        
        <div class="cart-footer">
          <div class="cart-actions">
            <el-button plain @click="clearCart">清空購物車</el-button>
            <el-button plain @click="$router.push('/shop/products')">繼續購物</el-button>
          </div>
          
          <div class="cart-summary">
            <div class="cart-total">
              <span>總計:</span>
              <span class="total-price">${{ calculateTotal() }}</span>
            </div>
            <el-button type="primary" @click="goToCheckout" :disabled="cartItems.length === 0">
              結算
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { 
  getCartItems, 
  updateCartItemQuantity, 
  removeFromCart as apiRemoveFromCart, 
  clearCart as apiClearCart 
} from '@/api/shop';

const router = useRouter();
const authStore = useAuthStore();
const cartItems = ref([]);
const loading = ref(false);

// 检查用户是否已登录
const checkLogin = () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('請先登入');
    router.push('/member/login');
    return false;
  }
  return true;
};

// 获取购物车内容
const fetchCartItems = async () => {
  if (!checkLogin()) return;
  
  loading.value = true;
  try {
    const response = await getCartItems();
    cartItems.value = response.data;
  } catch (error) {
    console.error('獲取購物車失敗:', error);
    ElMessage.error('獲取購物車失敗');
  } finally {
    loading.value = false;
  }
};

// 更新购物车商品数量
const updateQuantity = async (cartItemId, quantity) => {
  try {
    loading.value = true;
    await updateCartItemQuantity(cartItemId, quantity);
    
    // 获取最新购物车内容
    await fetchCartItems();
    ElMessage.success('已更新數量');
  } catch (error) {
    console.error('更新數量失敗:', error);
    ElMessage.error('更新數量失敗');
  } finally {
    loading.value = false;
  }
};

// 从购物车移除商品
const removeFromCart = async (cartItemId) => {
  try {
    await ElMessageBox.confirm('確定要從購物車移除此商品嗎？', '提示', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    loading.value = true;
    await apiRemoveFromCart(cartItemId);
    
    // 重新获取购物车内容
    await fetchCartItems();
    ElMessage.success('已從購物車移除');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除失敗:', error);
      ElMessage.error('移除失敗');
    }
  } finally {
    loading.value = false;
  }
};

// 清空购物车
const clearCart = async () => {
  if (cartItems.value.length === 0) {
    ElMessage.info('購物車已經是空的');
    return;
  }
  
  try {
    await ElMessageBox.confirm('確定要清空購物車嗎？', '提示', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    loading.value = true;
    await apiClearCart();
    
    // 清空本地购物车数据
    cartItems.value = [];
    ElMessage.success('購物車已清空');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空購物車失敗:', error);
      ElMessage.error('清空購物車失敗');
    }
  } finally {
    loading.value = false;
  }
};

// 计算购物车总价
const calculateTotal = () => {
  return cartItems.value
    .reduce((total, item) => total + item.product.price * item.quantity, 0)
    .toFixed(2);
};

// 去结算
const goToCheckout = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('購物車是空的，無法結算');
    return;
  }
  
  router.push('/shop/checkout');
};

onMounted(() => {
  fetchCartItems();
});
</script>

<style scoped>
.cart-management {
  padding: 20px;
}

.cart-container {
  max-width: 1000px;
  margin: 0 auto;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  padding: 20px;
}

.empty-cart {
  padding: 40px 0;
  text-align: center;
}

.cart-product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
}

.product-name {
  cursor: pointer;
  color: #409EFF;
}

.product-name:hover {
  text-decoration: underline;
}

.cart-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.cart-actions {
  display: flex;
  gap: 10px;
}

.cart-summary {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}
</style> 