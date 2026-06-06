import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaTicketAlt, FaFilm, FaStar, FaClock, FaCalendarAlt, FaUser, FaSignOutAlt } from 'react-icons/fa'
import MainLayout from '../../components/templates/MainLayout/MainLayout'
import Button from '../../components/atoms/Button/Button'
import { authService } from '../../services/auth.service'

const PanelUser = () => {
  const navigate = useNavigate()
  const user = authService.getUser()

  useEffect(() => {
    document.title = 'Mi Panel | FilmStars'
    
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  // Datos de ejemplo para compras recientes
  const recentPurchases = [
    { id: 1, movie: 'Dune: Parte 2', date: '2026-06-05', seats: 'A12, A13', amount: 'Q90.00' },
    { id: 2, movie: 'Kung Fu Panda 4', date: '2026-06-03', seats: 'B5', amount: 'Q45.00' },
    { id: 3, movie: 'Godzilla x Kong', date: '2026-05-28', seats: 'C8, C9', amount: 'Q90.00' },
  ]

  return (
    <MainLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {/* Header del Panel */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                ¡Bienvenido, {user?.nombre || 'Usuario'}!
              </h1>
              <p className="text-gray-400">
                Gestiona tus boletos y descubre nuevas películas
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <FaSignOutAlt className="inline mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="cinema-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Boletos Comprados</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <FaTicketAlt className="text-cinema-gold-500 text-3xl" />
            </div>
          </div>
          
          <div className="cinema-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Películas Vistas</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <FaFilm className="text-cinema-gold-500 text-3xl" />
            </div>
          </div>
          
          <div className="cinema-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Puntos Acumulados</p>
                <p className="text-2xl font-bold text-white">1,250</p>
              </div>
              <FaStar className="text-cinema-gold-500 text-3xl" />
            </div>
          </div>
          
          <div className="cinema-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Próximas Funciones</p>
                <p className="text-2xl font-bold text-white">2</p>
              </div>
              <FaClock className="text-cinema-gold-500 text-3xl" />
            </div>
          </div>
        </div>

        {/* Compras Recientes */}
        <div className="cinema-card p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Compras Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-400 font-semibold">Película</th>
                  <th className="pb-3 text-gray-400 font-semibold">Fecha</th>
                  <th className="pb-3 text-gray-400 font-semibold">Asientos</th>
                  <th className="pb-3 text-gray-400 font-semibold">Total</th>
                  <th className="pb-3 text-gray-400 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-800">
                    <td className="py-3 text-white">{purchase.movie}</td>
                    <td className="py-3 text-gray-400">{purchase.date}</td>
                    <td className="py-3 text-gray-400">{purchase.seats}</td>
                    <td className="py-3 text-gray-400">{purchase.amount}</td>
                    <td className="py-3">
                      <button className="text-cinema-gold-500 hover:text-cinema-gold-400 text-sm">
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cinema-card p-6 text-center hover:scale-105 transition-all cursor-pointer">
            <FaTicketAlt className="text-cinema-gold-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Comprar Boletos</h3>
            <p className="text-gray-400 text-sm">
              Explora la cartelera y adquiere tus boletos
            </p>
          </div>
          
          <div className="cinema-card p-6 text-center hover:scale-105 transition-all cursor-pointer">
            <FaCalendarAlt className="text-cinema-gold-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Próximos Estrenos</h3>
            <p className="text-gray-400 text-sm">
              Descubre las películas que vienen pronto
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default PanelUser
