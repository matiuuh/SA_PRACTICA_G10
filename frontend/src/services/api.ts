// src/services/api.ts

import axios from 'axios';
import { clearStoredSession, isTokenExpired } from './auth-token';

const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

const resolveApiGatewayUrl = () => {
  const explicitApiGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL?.trim();

  if (explicitApiGatewayUrl) {
    return explicitApiGatewayUrl;
  }

  if (typeof window !== 'undefined' && LOCAL_HOSTS.includes(window.location.hostname)) {
    return `http://${window.location.hostname}:3006`;
  }

  return '';
};

export const API_GATEWAY_URL = resolveApiGatewayUrl();

export const api = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    const requestUrl = config.url ?? '';
    const isLoginRequest = requestUrl.includes('/api/auth/login');

    if (token) {
      if (isTokenExpired(token)) {
        clearStoredSession();
        if (!isLoginRequest) {
          window.location.href = '/login';
        }
        return config;
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url ?? '';
    const isLoginRequest = requestUrl.includes('/api/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      clearStoredSession();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export const endpoints = {
  auth: '/api/auth',
  localidades: '/api/localidades',
  funciones: '/api/funciones',
  reservas: '/api/reservas',
  pagos: '/api/pagos',
  escaneo: '/api/escaneo',
};

export default api;
