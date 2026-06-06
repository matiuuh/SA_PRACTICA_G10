import axios from 'axios';

// Configuración del API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3006';

export const api = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Configuración de endpoints por servicio (a través del API Gateway)
export const endpoints = {
  auth: '/api/auth',      // Servicio de autenticación
  movies: '/api/movies',   // Servicio de películas
  bookings: '/api/bookings', // Servicio de reservas
  payments: '/api/payments', // Servicio de pagos
  locations: '/api/locations', // Servicio de ubicaciones
};

export default api;
