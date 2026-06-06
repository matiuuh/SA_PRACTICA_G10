import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaFilm, FaUser, FaUserPlus, FaBars, FaTimes, FaStar, FaSignOutAlt, FaCity, FaTheaterMasks } from 'react-icons/fa'
import Button from '../../atoms/Button/Button'
import { authService } from '../../../services/auth.service'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCinema, setSelectedCinema] = useState('')
  const [isUserPanel, setIsUserPanel] = useState(false)

  // Ciudades disponibles
  const cities = [
    { id: 1, name: 'Ciudad de Guatemala', value: 'gt' },
    { id: 2, name: 'Antigua Guatemala', value: 'antigua' },
    { id: 3, name: 'Quetzaltenango', value: 'xela' },
    { id: 4, name: 'Escuintla', value: 'escuintla' },
  ]

  // Cines según ciudad seleccionada
  const cinemas = {
    gt: [
      { id: 1, name: 'Cinépolis Miraflores' },
      { id: 2, name: 'Cinemark Oakland Mall' },
      { id: 3, name: 'Cine Centro Maya' },
    ],
    antigua: [
      { id: 4, name: 'Cine Colonial Antigua' },
      { id: 5, name: 'Cinépolis Antigua' },
    ],
    xela: [
      { id: 6, name: 'Cinemark Quetzaltenango' },
      { id: 7, name: 'Cine Universal Xela' },
    ],
    escuintla: [
      { id: 8, name: 'Cine Escuintla Center' },
    ],
  }

  // Determinar si el logo debe ser clickeable (solo en login/register)
  const shouldLogoBeClickable = location.pathname === '/login' || location.pathname === '/register'

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
    setUser(authService.getUser())
    
    // Verificar si estamos en el panel de usuario
    setIsUserPanel(window.location.pathname.includes('/panel/usuario'))
    
    // Cargar ciudad guardada
    const savedCity = localStorage.getItem('selectedCity')
    if (savedCity) {
      setSelectedCity(savedCity)
    } else if (cities.length > 0) {
      setSelectedCity(cities[0].value)
    }
    
    // Cargar cine guardado
    const savedCinema = localStorage.getItem('selectedCinema')
    if (savedCinema) {
      setSelectedCinema(savedCinema)
    }
  }, [location.pathname])

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value
    setSelectedCity(city)
    localStorage.setItem('selectedCity', city)
    setSelectedCinema('')
    localStorage.removeItem('selectedCinema')
    window.location.reload()
  }

  const handleCinemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cinema = e.target.value
    setSelectedCinema(cinema)
    localStorage.setItem('selectedCinema', cinema)
    window.location.reload()
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    navigate('/login')
  }

  const LogoContent = () => (
    <div className="flex items-center space-x-2 group">
      <div className="relative">
        <FaFilm className="text-cinema-red-500 text-2xl group-hover:scale-110 transition-transform" />
        <FaStar className="text-cinema-gold-500 text-xs absolute -top-1 -right-2" />
      </div>
      <span className="font-bold text-xl text-white">
        Film<span className="text-cinema-red-500">Stars</span>
      </span>
    </div>
  )

  return (
    <header className="bg-cinema-dark-900/95 backdrop-blur-sm border-b border-cinema-gold-500/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clickeable solo en login/register */}
          {shouldLogoBeClickable ? (
            <Link to="/home" className="cursor-pointer">
              <LogoContent />
            </Link>
          ) : (
            <LogoContent />
          )}

          {/* Combos de Ciudad y Cine - Solo en panel de usuario */}
          {isUserPanel && isAuthenticated && (
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold-500 text-sm" />
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="pl-9 pr-3 py-1.5 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cinema-gold-500 cursor-pointer"
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.value}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <FaTheaterMasks className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold-500 text-sm" />
                <select
                  value={selectedCinema}
                  onChange={handleCinemaChange}
                  disabled={!selectedCity}
                  className="pl-9 pr-3 py-1.5 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cinema-gold-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar cine</option>
                  {selectedCity && cinemas[selectedCity as keyof typeof cinemas]?.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <FaSignOutAlt className="inline mr-2" />
                Cerrar Sesión
              </Button>
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-cinema-gold-500"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {/* Combos móvil */}
            {isUserPanel && isAuthenticated && (
              <>
                <div className="relative">
                  <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold-500 text-sm" />
                  <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className="w-full pl-9 pr-3 py-2 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white text-sm"
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.value}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <FaTheaterMasks className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold-500 text-sm" />
                  <select
                    value={selectedCinema}
                    onChange={handleCinemaChange}
                    disabled={!selectedCity}
                    className="w-full pl-9 pr-3 py-2 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white text-sm disabled:opacity-50"
                  >
                    <option value="">Seleccionar cine</option>
                    {selectedCity && cinemas[selectedCity as keyof typeof cinemas]?.map((cinema) => (
                      <option key={cinema.id} value={cinema.id}>
                        {cinema.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                <FaSignOutAlt className="inline mr-2" />
                Cerrar Sesión
              </Button>
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
