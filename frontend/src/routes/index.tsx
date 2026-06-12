import type { ReactElement } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import PanelUser from '../pages/user/PanelUser'
import PanelAdmin from '../pages/admin/PanelAdmin'
import { authService } from '../services/auth.service'

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: ReactElement;
  requiredRole?: string;
}) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    const fallbackRoute = authService.hasRole('ADMINISTRADOR') ? '/panel/admin' : '/panel/usuario';
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/panel/usuario',
    element: (
      <ProtectedRoute requiredRole="CLIENTE">
        <PanelUser />
      </ProtectedRoute>
    ),
  },
  {
    path: '/panel/admin',
    element: (
      <ProtectedRoute requiredRole="ADMINISTRADOR">
        <PanelAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
])
