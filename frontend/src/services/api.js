import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  createProduct: (productData) => api.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  getUserPassword: (id) => api.get(`/users/${id}/password`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  updateUserPassword: (id, passwordData) => api.put(`/users/${id}/password`, passwordData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (query) => api.post('/chatbot/ask', { query }),
};

export default api;
