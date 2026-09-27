import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT Token into outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('voting_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept 401 Unauthorized responses
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    // If token expired or invalid, clear session
    localStorage.removeItem('voting_token');
    localStorage.removeItem('voting_user');
  }
  return Promise.reject(error);
});

export default api;
