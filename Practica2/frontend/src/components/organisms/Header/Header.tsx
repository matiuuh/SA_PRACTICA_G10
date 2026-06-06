import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaFilm, FaUser, FaUserPlus, FaBars, FaTimes, FaStar } from 'react-icons/fa'
import Button from '../../atoms/Button/Button'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header