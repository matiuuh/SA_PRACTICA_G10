import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { RegisterRequest, LoginRequest, User } from '../types/auth.types';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar usuario al iniciar
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(data);
      setUser(response.user);
      navigate('/home');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al registrar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(data);
      setUser(response.user);
      navigate('/home');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return {
    user,
    isLoading,
    error,
    register,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
  };
};
