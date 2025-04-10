const getCartItems = async () => { try { loading.value = true; const response = await
axios.get('/api/cart'); console.log('獲取購物車響應:', response); // 兼容多種響應格式 if
(response.data) { if (response.data.status === 'success' && response.data.data) { // 標準成功響應
{status: 'success', data: [...]} cartItems.value = response.data.data; } else if
(response.data.success && response.data.data) { // 另一種成功響應 {success: true, data: [...]}
cartItems.value = response.data.data; } else if (Array.isArray(response.data)) { // 直接返回數組
cartItems.value = response.data; } else { console.error('獲取購物車數據失敗: 響應格式不符合預期');
console.log('完整響應:', response.data); ElMessage.error('獲取購物車數據失敗，API響應格式不符');
cartItems.value = []; } calculateTotal(); } else { cartItems.value = [];
ElMessage.error('獲取購物車數據失敗，沒有收到響應數據'); } } catch (error) {
console.error('獲取購物車數據失敗:', error); ElMessage.error('獲取購物車數據失敗: ' +
(error.response?.data?.message || error.message || '未知錯誤')); cartItems.value = []; } finally {
loading.value = false; } };
