import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard
export const getDashboardData = () => api.get('/reports/dashboard');

// Rooms
export const getRooms = () => api.get('/rooms');
export const createRoom = (data: any) => api.post('/rooms', data);
export const deleteRoom = (id: string) => api.delete(`/rooms/${id}`);

// Tenants
export const getTenants = () => api.get('/tenants');
export const createTenant = (data: any) => api.post('/tenants', data);
export const vacateTenant = (id: string) => api.put(`/tenants/${id}/vacate`);

// Payments
export const getPayments = () => api.get('/payments');
export const recordPayment = (data: any) => api.post('/payments', data);

// Expenses
export const getExpenses = () => api.get('/expenses');
export const createExpense = (data: any) => api.post('/expenses', data);

// Maintenance
export const getMaintenanceRequests = () => api.get('/maintenance');
export const createMaintenanceRequest = (data: any) => api.post('/maintenance', data);
export const updateMaintenanceStatus = (id: string, status: string) => api.put(`/maintenance/${id}`, { status });

export default api;
