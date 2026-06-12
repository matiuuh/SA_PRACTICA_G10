export interface RegisterRequest {
  nombre: string;
  correo: string;
  password: string;
  rol: string;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
  };
}

export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
}

// Exportar todo como objeto también
const authTypes = {
  RegisterRequest: {} as RegisterRequest,
  LoginRequest: {} as LoginRequest,
  AuthResponse: {} as AuthResponse,
  User: {} as User,
};

export default authTypes;
