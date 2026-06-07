import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFilm, FaCalendarAlt, FaCity, FaTheaterMasks } from 'react-icons/fa'
import MainLayout from '../../components/templates/MainLayout/MainLayout'
import AdminPeliculas from '../../components/organisms/AdminPeliculas/AdminPeliculas'
import { authService } from '../../services/auth.service'
import { peliculasService } from '../../services/peliculas.service'
import type { Pelicula, AdminTabType } from '../../types/admin.types'

const PanelAdmin = () => {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [activeTab, setActiveTab] = useState<AdminTabType>('peliculas')
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])

  useEffect(() => {
    document.title = 'Panel de Administración | FilmStars'
    
    // Verificar autenticación
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    if (user?.rol !== 'ADMINISTRADOR') {
      navigate('/panel/usuario')
      return
    }
    
    // Cargar películas solo una vez
    const cargarPeliculas = async () => {
      try {
        const data = await peliculasService.getPeliculas()
        setPeliculas(data)
      } catch (error) {
        console.error('Error cargando películas:', error)
      }
    }
    
    cargarPeliculas()
  }, [navigate, user?.rol]) // Solo depende de navigate y el rol

  const handleAgregarPelicula = (pelicula: Pelicula) => {
    setPeliculas([...peliculas, pelicula])
  }

  const handleEditarPelicula = (pelicula: Pelicula) => {
    setPeliculas(peliculas.map(p => p.id_pelicula === pelicula.id_pelicula ? pelicula : p))
  }

  const handleEliminarPelicula = (id: string) => {
    setPeliculas(peliculas.filter(p => p.id_pelicula !== id))
  }

  const tabs = [
    { id: 'peliculas' as AdminTabType, label: 'Películas', icon: FaFilm },
    { id: 'localidades' as AdminTabType, label: 'Cines', icon: FaCity },
    { id: 'salas' as AdminTabType, label: 'Salas', icon: FaTheaterMasks },
    { id: 'funciones' as AdminTabType, label: 'Funciones', icon: FaCalendarAlt },
  ]

  return (
    <MainLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-gray-400">Bienvenido, {user?.nombre || 'Administrador'}</p>
        </div>

        <div className="cinema-card p-1 mb-8 flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-cinema-red-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-cinema-dark-800'
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {activeTab === 'peliculas' && (
          <AdminPeliculas
            peliculas={peliculas}
            onAgregar={handleAgregarPelicula}
            onEditar={handleEditarPelicula}
            onEliminar={handleEliminarPelicula}
          />
        )}

        {activeTab === 'localidades' && (
          <div className="cinema-card p-6">
            <p className="text-gray-400 text-center">Módulo de Cines en desarrollo</p>
          </div>
        )}

        {activeTab === 'salas' && (
          <div className="cinema-card p-6">
            <p className="text-gray-400 text-center">Módulo de Salas en desarrollo</p>
          </div>
        )}

        {activeTab === 'funciones' && (
          <div className="cinema-card p-6">
            <p className="text-gray-400 text-center">Módulo de Funciones en desarrollo</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default PanelAdmin
