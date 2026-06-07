import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFilm, FaCalendarAlt, FaCity, FaTheaterMasks, FaPlus } from 'react-icons/fa'
import MainLayout from '../../components/templates/MainLayout/MainLayout'
import AdminPeliculas from '../../components/organisms/AdminPeliculas/AdminPeliculas'
import AdminFunciones from '../../components/organisms/AdminFunciones/AdminFunciones'
import AdminLocalidades from '../../components/organisms/AdminLocalidades/AdminLocalidades'
import AdminSalas from '../../components/organisms/AdminSalas/AdminSalas'
import { authService } from '../../services/auth.service'
import { peliculasService } from '../../services/peliculas.service'
import type { Pelicula, AdminTabType } from '../../types/admin.types'

const PanelAdmin = () => {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [activeTab, setActiveTab] = useState<AdminTabType>('peliculas')
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])

  // Triggers para abrir modales desde el header
  const [triggerCiudad, setTriggerCiudad] = useState(0)
  const [triggerCine, setTriggerCine] = useState(0)
  const [triggerSala, setTriggerSala] = useState(0)

  useEffect(() => {
    document.title = 'Panel de Administración | FilmStars'
    if (!authService.isAuthenticated()) { navigate('/login'); return }
    if (user?.rol !== 'ADMINISTRADOR') { navigate('/panel/usuario'); return }

    peliculasService.getPeliculas()
      .then(setPeliculas)
      .catch(err => console.error('Error cargando películas:', err))
  }, [navigate, user?.rol])

  const handleAgregarPelicula = (p: Pelicula) => setPeliculas([...peliculas, p])
  const handleEditarPelicula = (p: Pelicula) => setPeliculas(peliculas.map(x => x.id_pelicula === p.id_pelicula ? p : x))
  const handleEliminarPelicula = (id: string) => setPeliculas(peliculas.filter(p => p.id_pelicula !== id))

  const tabs = [
    { id: 'peliculas' as AdminTabType, label: 'Películas', icon: FaFilm },
    { id: 'localidades' as AdminTabType, label: 'Cines', icon: FaCity },
    { id: 'salas' as AdminTabType, label: 'Salas', icon: FaTheaterMasks },
    { id: 'funciones' as AdminTabType, label: 'Funciones', icon: FaCalendarAlt },
  ]

  // Acciones rápidas por tab
  const quickActions: Record<AdminTabType, { label: string; onClick: () => void }[]> = {
    peliculas: [],
    localidades: [
      { label: 'Nueva Ciudad', onClick: () => setTriggerCiudad(t => t + 1) },
      { label: 'Nuevo Cine',   onClick: () => setTriggerCine(t => t + 1) },
    ],
    salas: [
      { label: 'Nueva Sala', onClick: () => setTriggerSala(t => t + 1) },
    ],
    funciones: [],
  }

  return (
    <MainLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Panel de Administración</h1>
            <p className="text-gray-400 text-sm">Bienvenido, {user?.nombre || 'Administrador'}</p>
          </div>

          {/* Botones de acción rápida según el tab activo */}
          {quickActions[activeTab].length > 0 && (
            <div className="flex gap-2">
              {quickActions[activeTab].map(action => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-2 bg-cinema-red-500 hover:bg-cinema-red-600 active:scale-95 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <FaPlus size={12} />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="cinema-card p-1 mb-6 flex flex-wrap gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium ${
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

        {/* Contenido */}
        {activeTab === 'peliculas' && (
          <AdminPeliculas
            peliculas={peliculas}
            onAgregar={handleAgregarPelicula}
            onEditar={handleEditarPelicula}
            onEliminar={handleEliminarPelicula}
          />
        )}

        {activeTab === 'localidades' && (
          <AdminLocalidades
            triggerCreateCiudad={triggerCiudad}
            triggerCreateCine={triggerCine}
          />
        )}

        {activeTab === 'salas' && (
          <AdminSalas triggerCreate={triggerSala} />
        )}

        {activeTab === 'funciones' && (
          <AdminFunciones
            funciones={[]}
            peliculas={peliculas}
            salas={[]}
            onAgregar={() => {}}
            onEditar={() => {}}
            onEliminar={() => {}}
          />
        )}
      </div>
    </MainLayout>
  )
}

export default PanelAdmin
