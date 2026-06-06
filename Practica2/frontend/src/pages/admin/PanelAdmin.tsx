import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaFilm, FaStar, FaTicketAlt, FaUsers, FaCalendarAlt, 
  FaTheaterMasks, FaChartLine, FaCog, FaSignOutAlt, 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch
} from 'react-icons/fa'
import MainLayout from '../../components/templates/MainLayout/MainLayout'
import Button from '../../components/atoms/Button/Button'
import { authService } from '../../services/auth.service'

interface Pelicula {
  id: number
  titulo: string
  genero: string
  duracion: string
  fechaEstreno: string
  estado: 'estreno' | 'preventa' | 'reestreno'
}

const PanelAdmin = () => {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [activeTab, setActiveTab] = useState('peliculas')
  const [peliculas, setPeliculas] = useState<Pelicula[]>([
    { id: 1, titulo: 'sexo: Parte 2', genero: 'Ciencia Ficción', duracion: '2h 46min', fechaEstreno: '2026-03-01', estado: 'estreno' },
    { id: 2, titulo: 'Kung Fu Panda 4', genero: 'Animación', duracion: '1h 34min', fechaEstreno: '2026-03-08', estado: 'estreno' },
    { id: 3, titulo: 'Godzilla x Kong', genero: 'Acción', duracion: '1h 55min', fechaEstreno: '2026-04-12', estado: 'preventa' },
    { id: 4, titulo: 'Titanic (Reestreno)', genero: 'Romance', duracion: '3h 14min', fechaEstreno: '2026-02-14', estado: 'reestreno' },
  ])

  useEffect(() => {
    document.title = 'Panel de Administración | FilmStars'
    
    // Verificar si el usuario está autenticado y es ADMIN
    if (!authService.isAuthenticated()) {
      navigate('/login')
    } else if (user?.rol !== 'ADMINISTRADOR') {
      navigate('/panel/usuario')
    }
  }, [navigate, user])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const stats = [
    { title: 'Películas', value: '24', icon: FaFilm, color: 'bg-cinema-red-500' },
    { title: 'Usuarios', value: '1,234', icon: FaUsers, color: 'bg-cinema-gold-500' },
    { title: 'Boletos Vendidos', value: '8,456', icon: FaTicketAlt, color: 'bg-cinema-red-500' },
    { title: 'Funciones', value: '156', icon: FaTheaterMasks, color: 'bg-cinema-gold-500' },
  ]

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'estreno': return 'bg-green-500/20 text-green-400'
      case 'preventa': return 'bg-blue-500/20 text-blue-400'
      case 'reestreno': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getEstadoTexto = (estado: string) => {
    switch(estado) {
      case 'estreno': return 'En Estreno'
      case 'preventa': return 'En Preventa'
      case 'reestreno': return 'Re-Estreno'
      default: return estado
    }
  }

  return (
    <MainLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-400">
              Bienvenido, {user?.nombre || 'Administrador'}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <FaSignOutAlt className="inline mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="cinema-card p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="text-white text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="cinema-card p-1 mb-6 flex space-x-1">
          <button
            onClick={() => setActiveTab('peliculas')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'peliculas'
                ? 'bg-cinema-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaFilm className="inline mr-2" />
            Películas
          </button>
          <button
            onClick={() => setActiveTab('funciones')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'funciones'
                ? 'bg-cinema-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Funciones
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'usuarios'
                ? 'bg-cinema-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaUsers className="inline mr-2" />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('reportes')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'reportes'
                ? 'bg-cinema-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaChartLine className="inline mr-2" />
            Reportes
          </button>
        </div>

        {/* Tab: Películas */}
        {activeTab === 'peliculas' && (
          <div className="cinema-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Gestión de Películas</h2>
              <Button variant="primary" size="sm">
                <FaPlus className="inline mr-2" />
                Agregar Película
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative mb-6">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar películas..."
                className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 text-gray-400 font-semibold">Título</th>
                    <th className="pb-3 text-gray-400 font-semibold">Género</th>
                    <th className="pb-3 text-gray-400 font-semibold">Duración</th>
                    <th className="pb-3 text-gray-400 font-semibold">Fecha Estreno</th>
                    <th className="pb-3 text-gray-400 font-semibold">Estado</th>
                    <th className="pb-3 text-gray-400 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {peliculas.map((pelicula) => (
                    <tr key={pelicula.id} className="border-b border-gray-800 hover:bg-white/5">
                      <td className="py-3 text-white">{pelicula.titulo}</td>
                      <td className="py-3 text-gray-400">{pelicula.genero}</td>
                      <td className="py-3 text-gray-400">{pelicula.duracion}</td>
                      <td className="py-3 text-gray-400">{pelicula.fechaEstreno}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(pelicula.estado)}`}>
                          {getEstadoTexto(pelicula.estado)}
                        </span>
                       </td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <button className="text-blue-400 hover:text-blue-300">
                            <FaEye />
                          </button>
                          <button className="text-cinema-gold-500 hover:text-cinema-gold-400">
                            <FaEdit />
                          </button>
                          <button className="text-cinema-red-500 hover:text-cinema-red-400">
                            <FaTrash />
                          </button>
                        </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Funciones */}
        {activeTab === 'funciones' && (
          <div className="cinema-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Gestión de Funciones</h2>
              <Button variant="primary" size="sm">
                <FaPlus className="inline mr-2" />
                Agregar Función
              </Button>
            </div>
            <p className="text-gray-400 text-center py-8">
              Aquí se mostrarán todas las funciones disponibles en los cines
            </p>
          </div>
        )}

        {/* Tab: Usuarios */}
        {activeTab === 'usuarios' && (
          <div className="cinema-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
              <Button variant="primary" size="sm">
                <FaPlus className="inline mr-2" />
                Agregar Usuario
              </Button>
            </div>
            <p className="text-gray-400 text-center py-8">
              Aquí se mostrarán todos los usuarios registrados en la plataforma
            </p>
          </div>
        )}

        {/* Tab: Reportes */}
        {activeTab === 'reportes' && (
          <div className="cinema-card p-6">
            <h2 className="text-xl font-bold text-white mb-6">Reportes y Estadísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-cinema-dark-900/50 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Boletos por Mes</h3>
                <div className="h-48 flex items-center justify-center">
                  <FaChartLine className="text-cinema-gold-500 text-4xl" />
                  <p className="text-gray-400 ml-3">Gráfico de ventas aquí</p>
                </div>
              </div>
              <div className="bg-cinema-dark-900/50 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Películas Más Vistas</h3>
                <div className="h-48 flex items-center justify-center">
                  <FaFilm className="text-cinema-gold-500 text-4xl" />
                  <p className="text-gray-400 ml-3">Top 10 películas aquí</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default PanelAdmin
