import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Request interceptor to add JWT token to all requests
API.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('devvault_user');
    if (userJson) {
      try {
        const { token } = JSON.parse(userJson);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to parse stored user json:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
