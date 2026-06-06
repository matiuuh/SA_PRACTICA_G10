import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaFilm, FaUser, FaUserPlus, FaBars, FaTimes, FaStar, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'
import Button from '../../atoms/Button/Button'
import { authService } from '../../../services/auth.service'

const Header = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
    setUser(authService.getUser())
  }, [location.pathname])

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    navigate('/login')
  }

  return (
    <header className="bg-cinema-dark-900/95 backdrop-blur-sm border-b border-cinema-gold-500/20 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center space-x-2 hover:opacity-80 transition-opacity group">
            <div className="relative">
              <FaFilm className="text-cinema-red-500 text-2xl group-hover:scale-110 transition-transform" />
              <FaStar className="text-cinema-gold-500 text-xs absolute -top-1 -right-2" />
            </div>
            <span className="font-bold text-xl text-white">
              Film<span className="text-cinema-red-500">Stars</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <FaUserCircle className="text-cinema-gold-500 text-2xl" />
                  <span className="text-white text-sm">
                    Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}
                  </span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <FaSignOutAlt className="inline mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <FaUser className="inline mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    <FaUserPlus className="inline mr-2" />
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-cinema-gold-500"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 py-2">
                  <FaUserCircle className="text-cinema-gold-500 text-2xl" />
                  <span className="text-white">Hola, {user?.nombre || 'Usuario'}</span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                  <FaSignOutAlt className="inline mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <FaUser className="inline mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    <FaUserPlus className="inline mr-2" />
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
