import axios from 'axios';

const _raw = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const baseURL = _raw.endsWith('/api') ? _raw : `${_raw}/api`;
const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('franellUser') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getFeaturedProducts = () => api.get('/products/featured');
export const getTopReviews = () => api.get('/products/top-reviews');
export const getBestseller = () => api.get('/products/bestseller');
export const getProduct = (id) => api.get(`/products/${id}`);
export const addReview = (id, data) => api.post(`/products/${id}/reviews`, data);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/myorders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const payOrder = (id, data) => api.put(`/orders/${id}/pay`, data);

// Payment
export const createPaymentIntent = (amount) => api.post('/payment/create-payment-intent', { amount });

// Admin
export const getAdminStats          = ()              => api.get('/admin/stats');
export const adminGetOrders         = ()              => api.get('/orders');
export const adminUpdateOrderStatus = (id, status)   => api.put(`/orders/${id}/status`, { status });
export const adminCreateProduct     = (data)          => api.post('/products', data);
export const adminUpdateProduct     = (id, data)      => api.put(`/products/${id}`, data);
export const adminDeleteProduct     = (id)            => api.delete(`/products/${id}`);
export const adminGetUsers          = ()              => api.get('/admin/users');
export const adminDeleteUser        = (id)            => api.delete(`/admin/users/${id}`);

// Categories
export const getCategories         = ()              => api.get('/categories');
export const adminCreateCategory   = (data)          => api.post('/categories', data);
export const adminUpdateCategory   = (id, data)      => api.put(`/categories/${id}`, data);
export const adminDeleteCategory   = (id)            => api.delete(`/categories/${id}`);

// Settings
export const getAnnouncement       = ()              => api.get('/settings/announcement');
export const updateAnnouncement    = (value)         => api.put('/settings/announcement', { value });

// Settings / Perks & Pill
export const getPerks              = ()              => api.get('/settings/perks');
export const updatePerks           = (perks)         => api.put('/settings/perks', { perks });
export const getHeroPill           = ()              => api.get('/settings/hero-pill');
export const updateHeroPill        = (d)             => api.put('/settings/hero-pill', d);

// Site Stats
export const getSiteStats          = ()              => api.get('/products/stats');

// Hero Slides
export const getHeroSlides         = ()              => api.get('/hero-slides');
export const addHeroSlide          = (imageUrl)      => api.post('/hero-slides', { imageUrl });
export const deleteHeroSlide       = (id)            => api.delete(`/hero-slides/${id}`);
export const uploadHeroImage       = (formData)      => api.post('/hero-slides/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const reorderHeroSlides     = (ids)           => api.put('/hero-slides/reorder', { ids });

export default api;
