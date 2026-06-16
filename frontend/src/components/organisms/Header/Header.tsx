import { useEffect, useState } from 'react';
import {
  FaBars,
  FaCity,
  FaFilm,
  FaSignOutAlt,
  FaStar,
  FaTheaterMasks,
  FaTimes,
  FaUser,
  FaUserPlus,
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { localidadesService } from '../../../services/localidades.service';
import type { Cine, Ciudad } from '../../../types/localidades.types';
import Button from '../../atoms/Button/Button';

const CITY_STORAGE_KEY = 'selectedCity';
const CINEMA_STORAGE_KEY = 'selectedCinema';
const SELECTION_EVENT = 'filmstars-selection-changed';

interface HeaderProps {
  lockLocationSelection?: boolean;
}

const Header: React.FC<HeaderProps> = ({ lockLocationSelection = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [isUserPanel, setIsUserPanel] = useState(false);
  const [cities, setCities] = useState<Ciudad[]>([]);
  const [cinemas, setCinemas] = useState<Cine[]>([]);

  const shouldLogoBeClickable =
    location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setIsUserPanel(location.pathname.includes('/panel/usuario'));
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !isUserPanel) {
      return;
    }

    const loadCities = async () => {
      try {
        const loadedCities = await localidadesService.getCiudades();
        setCities(loadedCities);

        const savedCity = localStorage.getItem(CITY_STORAGE_KEY);
        const nextCity =
          savedCity && loadedCities.some((city) => city.id === savedCity)
            ? savedCity
            : loadedCities[0]?.id || '';

        setSelectedCity(nextCity);

        if (nextCity) {
          localStorage.setItem(CITY_STORAGE_KEY, nextCity);
        }
      } catch (error) {
        console.error('No se pudieron cargar las ciudades', error);
        setCities([]);
      }
    };

    void loadCities();
  }, [isAuthenticated, isUserPanel]);

  useEffect(() => {
    if (!isAuthenticated || !isUserPanel || !selectedCity) {
      setCinemas([]);
      setSelectedCinema('');
      return;
    }

    const loadCinemas = async () => {
      try {
        const loadedCinemas = await localidadesService.getCinesByCiudad(selectedCity);
        setCinemas(loadedCinemas);

        const savedCinema = localStorage.getItem(CINEMA_STORAGE_KEY);
        const nextCinema =
          savedCinema && loadedCinemas.some((cinema) => cinema.id === savedCinema)
            ? savedCinema
            : '';

        setSelectedCinema(nextCinema);

        if (nextCinema) {
          localStorage.setItem(CINEMA_STORAGE_KEY, nextCinema);
        } else {
          localStorage.removeItem(CINEMA_STORAGE_KEY);
        }
      } catch (error) {
        console.error('No se pudieron cargar los cines', error);
        setCinemas([]);
        setSelectedCinema('');
      }
    };

    void loadCinemas();
  }, [isAuthenticated, isUserPanel, selectedCity]);

  const notifySelectionChange = () => {
    window.dispatchEvent(new CustomEvent(SELECTION_EVENT));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (lockLocationSelection) {
      return;
    }

    const cityId = e.target.value;
    setSelectedCity(cityId);
    setSelectedCinema('');
    localStorage.setItem(CITY_STORAGE_KEY, cityId);
    localStorage.removeItem(CINEMA_STORAGE_KEY);
    notifySelectionChange();
  };

  const handleCinemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (lockLocationSelection) {
      return;
    }

    const cinemaId = e.target.value;
    setSelectedCinema(cinemaId);

    if (cinemaId) {
      localStorage.setItem(CINEMA_STORAGE_KEY, cinemaId);
    } else {
      localStorage.removeItem(CINEMA_STORAGE_KEY);
    }

    notifySelectionChange();
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const LogoContent = () => (
    <div className="flex items-center space-x-2 group">
      <div className="relative">
        <FaFilm className="text-cinema-red-500 text-2xl group-hover:scale-110 transition-transform" />
        <FaStar className="text-cinema-gold-500 text-xs absolute -top-1 -right-2" />
      </div>
      <span className="font-bold text-xl text-white">
        Film<span className="text-cinema-red-500">Calificacion</span>
      </span>
    </div>
  );

  return (
    <header className="bg-cinema-dark-900/95 backdrop-blur-sm border-b border-cinema-gold-500/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {shouldLogoBeClickable ? (
            <Link to="/home" className="cursor-pointer">
              <LogoContent />
            </Link>
          ) : (
            <LogoContent />
          )}

          {isUserPanel && isAuthenticated && (
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold-500 text-sm" />
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  disabled={lockLocationSelection}
                  title={lockLocationSelection ? 'No puedes cambiar la ciudad durante la reserva de asientos' : undefined}
                  className="pl-9 pr-3 py-1.5 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cinema-gold-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar ciudad</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <FaTheaterMasks className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold-500 text-sm" />
                <select
                  value={selectedCinema}
                  onChange={handleCinemaChange}
                  disabled={!selectedCity || lockLocationSelection}
                  title={lockLocationSelection ? 'No puedes cambiar el cine durante la reserva de asientos' : undefined}
                  className="pl-9 pr-3 py-1.5 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cinema-gold-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar cine</option>
                  {cinemas.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <FaSignOutAlt className="inline mr-2" />
                Cerrar Sesion
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <FaUser className="inline mr-2" />
                    Iniciar Sesion
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
          <div className="md:hidden pb-4 space-y-3">
            {isUserPanel && isAuthenticated && (
              <>
                <div className="relative">
                  <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold-500 text-sm" />
                  <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    disabled={lockLocationSelection}
                    title={lockLocationSelection ? 'No puedes cambiar la ciudad durante la reserva de asientos' : undefined}
                    className="w-full pl-9 pr-3 py-2 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar ciudad</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <FaTheaterMasks className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-gold-500 text-sm" />
                  <select
                    value={selectedCinema}
                    onChange={handleCinemaChange}
                    disabled={!selectedCity || lockLocationSelection}
                    title={lockLocationSelection ? 'No puedes cambiar el cine durante la reserva de asientos' : undefined}
                    className="w-full pl-9 pr-3 py-2 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar cine</option>
                    {cinemas.map((cinema) => (
                      <option key={cinema.id} value={cinema.id}>
                        {cinema.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                <FaSignOutAlt className="inline mr-2" />
                Cerrar Sesion
              </Button>
            ) : (
              <>
                <Link to="/login" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <FaUser className="inline mr-2" />
                    Iniciar Sesion
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
  );
};

export default Header;
