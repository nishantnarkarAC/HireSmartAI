import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fileUrl = (name) => (name ? `${API_URL}/uploads/${name}` : null);
export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export const CATEGORIES = ['IT', 'Finance', 'HR', 'Marketing', 'Sales', 'Design', 'Healthcare', 'Education', 'Operations'];
export const JOB_TYPES = ['Full-time', 'Part-time', 'Internship'];

export const formatSalary = (min, max) => {
  const f = (n) => (n >= 100000 ? `${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : n.toLocaleString('en-IN'));
  if (!min && !max) return 'Not disclosed';
  if (!max) return `₹${f(min)}+`;
  return `₹${f(min)} – ₹${f(max)}`;
};

export default api;
