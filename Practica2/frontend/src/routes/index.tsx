import { createBrowserRouter, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import PanelUser from '../pages/user/PanelUser'
import PanelAdmin from '../pages/admin/PanelAdmin'

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
    element: <PanelUser />,
  },
  {
    path: '/panel/admin',
    element: <PanelAdmin />,
  },
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
])
