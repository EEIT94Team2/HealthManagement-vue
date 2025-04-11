<template>
  <div class="payment-simulation">
    <el-card class="simulation-container" v-loading="loading">
      <template #header>
        <div class="simulation-header">
          <h2>支付模擬系統</h2>
          <div class="right">
            <el-tag type="warning">管理員專用</el-tag>
          </div>
        </div>
      </template>
      
      <!-- 管理员访问控制 -->
      <div v-if="!isAdmin" class="access-denied">
        <el-result
          icon="error"
          title="訪問被拒絕"
          sub-title="抱歉，只有管理員才能訪問此頁面"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/dashboard')">返回首頁</el-button>
          </template>
        </el-result>
      </div>
      
      <!-- 管理员访问内容 -->
      <div v-else class="simulation-content">
        <div class="section order-search">
          <h3>查詢訂單支付狀態</h3>
          <el-form :model="searchForm" label-width="120px">
            <el-form-item label="訂單編號">
              <el-input v-model="searchForm.orderId" placeholder="請輸入訂單編號" />
            </el-form-item>
            <el-form-item label="支付編號">
              <el-input v-model="searchForm.paymentId" placeholder="請輸入支付編號" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchPayment">查詢支付狀態</el-button>
            </el-form-item>
          </el-form>
          
          <div v-if="paymentInfo" class="payment-info">
            <el-result
              :icon="getPaymentResultIcon(paymentInfo.status)"
              :title="getPaymentResultTitle(paymentInfo.status)"
              :sub-title="`支付編號: ${paymentInfo.id}`"
            >
              <template #extra>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="訂單編號">{{ paymentInfo.orderId }}</el-descriptions-item>
                  <el-descriptions-item label="支付時間">{{ formatDate(paymentInfo.paidAt) }}</el-descriptions-item>
                  <el-descriptions-item label="支付方式">{{ paymentInfo.method }}</el-descriptions-item>
                  <el-descriptions-item label="支付金額">${{ paymentInfo.amount }}</el-descriptions-item>
                </el-descriptions>
                
                <div class="actions" v-if="paymentInfo.status === 'PENDING'">
                  <el-button type="success" @click="simulatePaymentCallback(paymentInfo.id, 'SUCCESS')">
                    模擬支付成功
                  </el-button>
                  <el-button type="danger" @click="simulatePaymentCallback(paymentInfo.id, 'FAILED')">
                    模擬支付失敗
                  </el-button>
                </div>
              </template>
            </el-result>
          </div>
        </div>
        
        <el-divider content-position="center">或者</el-divider>
        
        <div class="section pending-payments">
          <h3>待處理支付清單</h3>
          <div v-if="pendingPayments.length === 0" class="empty-pending">
            <el-empty description="沒有待處理的支付" />
          </div>
          
          <el-table v-else :data="pendingPayments" style="width: 100%">
            <el-table-column prop="id" label="支付編號" width="150" />
            <el-table-column prop="orderId" label="訂單編號" width="120" />
            <el-table-column prop="amount" label="金額" width="120">
              <template #default="{ row }">
                ${{ row.amount }}
              </template>
            </el-table-column>
            <el-table-column prop="method" label="支付方式" width="120" />
            <el-table-column prop="createdAt" label="創建時間" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="狀態" width="120">
              <template #default="{ row }">
                <el-tag :type="getPaymentStatusType(row.status)">
                  {{ getPaymentStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button 
                  type="success" 
                  size="small"
                  @click="simulatePaymentCallback(row.id, 'SUCCESS')"
                >
                  模擬成功
                </el-button>
                <el-button 
                  type="danger" 
                  size="small"
                  @click="simulatePaymentCallback(row.id, 'FAILED')"
                >
                  模擬失敗
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { getPaymentStatus, mockPaymentCallback } from '@/api/shop';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const searchForm = ref({
  orderId: '',
  paymentId: ''
});
const paymentInfo = ref(null);
const pendingPayments = ref([]);

// 检查是否为管理员
const isAdmin = computed(() => {
  return authStore.userRole === 'admin';
});

// 获取支付状态标签类型
const getPaymentStatusType = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'SUCCESS':
      return 'success';
    case 'FAILED':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取支付状态显示文本
const getPaymentStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return '處理中';
    case 'SUCCESS':
      return '成功';
    case 'FAILED':
      return '失敗';
    default:
      return status;
  }
};

// 获取支付结果图标
const getPaymentResultIcon = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'SUCCESS':
      return 'success';
    case 'FAILED':
      return 'error';
    default:
      return 'info';
  }
};

// 获取支付结果标题
const getPaymentResultTitle = (status) => {
  switch (status) {
    case 'PENDING':
      return '支付處理中';
    case 'SUCCESS':
      return '支付成功';
    case 'FAILED':
      return '支付失敗';
    default:
      return '支付狀態未知';
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 查询支付状态
const searchPayment = async () => {
  if (!searchForm.value.paymentId) {
    ElMessage.warning('請輸入支付編號');
    return;
  }
  
  loading.value = true;
  try {
    const response = await getPaymentStatus(searchForm.value.paymentId);
    paymentInfo.value = response.data;
  } catch (error) {
    console.error('查詢支付狀態失敗:', error);
    ElMessage.error('查詢支付狀態失敗');
  } finally {
    loading.value = false;
  }
};

// 模拟支付回调
const simulatePaymentCallback = async (paymentId, status) => {
  loading.value = true;
  try {
    await mockPaymentCallback(paymentId);
    
    // 只是模拟，实际上后端没有 status 参数
    ElMessage.success(`模擬支付${status === 'SUCCESS' ? '成功' : '失敗'}操作完成`);
    
    // 刷新支付信息
    if (paymentInfo.value && paymentInfo.value.id === paymentId) {
      const response = await getPaymentStatus(paymentId);
      paymentInfo.value = response.data;
    }
    
    // 刷新待处理支付列表
    fetchPendingPayments();
  } catch (error) {
    console.error('模擬支付回調失敗:', error);
    ElMessage.error('模擬支付回調失敗');
  } finally {
    loading.value = false;
  }
};

// 获取待处理支付列表
const fetchPendingPayments = async () => {
  // 这里应该调用API获取待处理支付列表，但后端未提供该接口
  // 模拟一些待处理的支付
  pendingPayments.value = [
    {
      id: 'PAY123456789',
      orderId: 1001,
      amount: 299.99,
      method: 'CREDIT_CARD',
      createdAt: new Date(),
      status: 'PENDING'
    },
    {
      id: 'PAY987654321',
      orderId: 1002,
      amount: 599.50,
      method: 'ALIPAY',
      createdAt: new Date(Date.now() - 3600000), // 1小时前
      status: 'PENDING'
    }
  ];
};

onMounted(() => {
  if (isAdmin.value) {
    fetchPendingPayments();
  }
});
</script>

<style scoped>
.payment-simulation {
  padding: 20px;
}

.simulation-container {
  max-width: 1000px;
  margin: 0 auto;
}

.simulation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.access-denied {
  padding: 20px;
  text-align: center;
}

.simulation-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section {
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #409EFF;
  font-weight: 500;
}

.payment-info {
  margin-top: 20px;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.empty-pending {
  padding: 30px 0;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}
</style> 