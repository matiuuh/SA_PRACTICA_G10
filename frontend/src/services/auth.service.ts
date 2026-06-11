import { api, endpoints } from './api';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '../types/auth.types';
import { clearStoredSession, isTokenExpired, parseTokenPayload } from './auth-token';

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
    clearStoredSession();
  }

  getToken(): string | null {
    const token = localStorage.getItem('access_token');

    if (!token) {
      return null;
    }

    if (isTokenExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  getUser(): User | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    const payload = parseTokenPayload(token);

    if (!payload) {
      this.logout();
      return null;
    }

    const derivedUser: User = {
      id: payload.sub,
      nombre: payload.name,
      correo: payload.email,
      rol: payload.role,
    };

    // El JWT es la fuente de verdad para rol e identidad; localStorage solo cachea la vista.
    localStorage.setItem('user', JSON.stringify(derivedUser));
    return derivedUser;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getUser()?.rol === role;
  }
}

export const authService = new AuthService();
