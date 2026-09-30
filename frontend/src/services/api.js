import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Dashboard
  getDashboard: () => apiClient.get('/dashboard').then((res) => res.data),

  // Items
  getItems: (params) => apiClient.get('/items', { params }).then((res) => res.data),
  getItemById: (id) => apiClient.get(`/items/${id}`).then((res) => res.data),
  createItem: (data) => apiClient.post('/items', data).then((res) => res.data),
  updateItem: (id, data) => apiClient.put(`/items/${id}`, data).then((res) => res.data),
  deleteItem: (id) => apiClient.delete(`/items/${id}`).then((res) => res.data),
  getLowStockItems: (threshold = 10) => apiClient.get('/items/low-stock', { params: { threshold } }).then((res) => res.data),
  getCategories: () => apiClient.get('/items/categories').then((res) => res.data),

  // Suppliers
  getSuppliers: () => apiClient.get('/suppliers').then((res) => res.data),
  getSupplierById: (id) => apiClient.get(`/suppliers/${id}`).then((res) => res.data),
  createSupplier: (data) => apiClient.post('/suppliers', data).then((res) => res.data),
  updateSupplier: (id, data) => apiClient.put(`/suppliers/${id}`, data).then((res) => res.data),
  deleteSupplier: (id) => apiClient.delete(`/suppliers/${id}`).then((res) => res.data),
};

export default api;
