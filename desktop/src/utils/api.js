const axios = require('axios');

// Base URL for API
const API_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('tzuru_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Auth endpoints
const auth = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/auth/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  updateUserType: async (userType) => {
    try {
      const response = await api.put('/auth/usertype', { userType });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

module.exports = { auth };