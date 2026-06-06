import { createBrowserRouter, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'

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
    path: '/',
    element: <Navigate to="/home" replace />,
  },
])
