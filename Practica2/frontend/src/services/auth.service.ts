import { api, endpoints } from './api';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth.types';

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Solo registrar, no guardar sesión automáticamente
    const response = await api.post<AuthResponse>(`${endpoints.auth}/register`, data);
    
    // NO guardar token y usuario automáticamente
    // El usuario debe hacer login después de registrarse
    
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${endpoints.auth}/login`, data);
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
