import axios from "@/api/config/axios";

// 商品相关API
export const getProducts = () => {
  return axios.get("/api/products");
};

export const getProductById = (id) => {
  return axios.get(`/api/products/${id}`);
};

export const createProduct = (product) => {
  return axios.post("/api/products", product);
};

export const updateProduct = (id, product) => {
  return axios.put(`/api/products/${id}`, product);
};

export const deleteProduct = (id) => {
  return axios.delete(`/api/products/${id}`);
};

export const searchProducts = (keyword) => {
  return axios.get(`/api/products/search?keyword=${keyword}`);
};

export const getProductsByPriceRange = (minPrice, maxPrice) => {
  return axios.get(`/api/products/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`);
};

// 购物车相关API
export const getCartItems = (userId) => {
  const params = userId ? { userId } : {};
  return axios.get("/api/cart/items", { params });
};

export const addToCart = (product, userId) => {
  const params = userId ? { userId } : {};
  return axios.post("/api/cart/items", product, { params });
};

export const updateCartItemQuantity = (cartItemId, quantity, userId) => {
  const params = { quantity, ...(userId ? { userId } : {}) };
  return axios.put(`/api/cart/items/${cartItemId}/quantity`, null, { params });
};

export const removeFromCart = (cartItemId, userId) => {
  const params = userId ? { userId } : {};
  return axios.delete(`/api/cart/items/${cartItemId}`, { params });
};

export const clearCart = (userId) => {
  const params = userId ? { userId } : {};
  return axios.delete("/api/cart/clear", { params });
};

export const calculateCartTotal = (userId) => {
  const params = userId ? { userId } : {};
  return axios.get("/api/cart/total", { params });
};

// 订单相关API
export const createOrder = (orderData) => {
  return axios.post("/api/order", orderData);
};

export const createOrderFromCart = (userId) => {
  return axios.post(`/api/order/cart?userId=${userId}`);
};

export const getOrderById = (orderId) => {
  return axios.get(`/api/order/${orderId}`);
};

export const getOrders = (params) => {
  return axios.get("/api/order", { params });
};

export const getOrdersByUserId = (userId) => {
  return axios.get(`/api/order?userId=${userId}`);
};

// 支付相关API
export const createPayment = (orderId, paymentData) => {
  return axios.post(`/api/order/${orderId}/payment`, paymentData);
};

export const getPaymentStatus = (paymentId) => {
  return axios.get(`/api/order/payment/${paymentId}/status`);
};

export const mockPaymentCallback = (paymentId) => {
  return axios.post(`/api/order/payment/${paymentId}/mock`);
}; 