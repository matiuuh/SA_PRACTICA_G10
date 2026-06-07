import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFilm, FaCalendarAlt, FaCity, FaTheaterMasks } from 'react-icons/fa'
import MainLayout from '../../components/templates/MainLayout/MainLayout'
import AdminPeliculas from '../../components/organisms/AdminPeliculas/AdminPeliculas'
import AdminFunciones from '../../components/organisms/AdminFunciones/AdminFunciones'
import AdminLocalidades from '../../components/organisms/AdminLocalidades/AdminLocalidades'
import AdminSalas from '../../components/organisms/AdminSalas/AdminSalas'
import { authService } from '../../services/auth.service'
import type { Pelicula, Funcion, Localidad, Sala, AdminTabType } from '../../types/admin.types'

const PanelAdmin = () => {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [activeTab, setActiveTab] = useState<AdminTabType>('peliculas')

  const [peliculas, setPeliculas] = useState<Pelicula[]>([
    {
      id: 1,
      titulo: 'Dune: Parte 2',
      genero: 'Ciencia Ficción',
      duracion: '2h 46min',
      clasificacion: 'PG-13',
      sinopsis: 'Paul Atreides se une a Chani y los Fremen mientras busca venganza.',
      categoria: 'estreno',
      imagen: '',
      fechaEstreno: '2026-03-01'
    }
  ])

  const [localidades, setLocalidades] = useState<Localidad[]>([
    {
      id: 1,
      ciudad: 'Ciudad de Guatemala',
      cine: 'Cinépolis Miraflores',
      direccion: 'Centro Comercial Miraflores, Zona 11'
    }
  ])

  const [salas, setSalas] = useState<Sala[]>([
    {
      id: 1,
      localidadId: 1,
      localidadNombre: 'Cinépolis Miraflores',
      nombre: 'Sala 1',
      capacidad: 150,
      tipo: 'normal'
    }
  ])

  const [funciones, setFunciones] = useState<Funcion[]>([
    {
      id: 1,
      peliculaId: 1,
      peliculaNombre: 'Dune: Parte 2',
      salaId: 1,
      salaNombre: 'Sala 1',
      localidadNombre: 'Cinépolis Miraflores',
      fecha: '2026-06-10',
      horario: '20:30',
      precio: 45
    }
  ])

  useEffect(() => {
    document.title = 'Panel de Administración | FilmStars'
    if (!authService.isAuthenticated()) {
      navigate('/login')
    } else if (user?.rol !== 'ADMINISTRADOR') {
      navigate('/panel/usuario')
    }
  }, [navigate, user])

  const handleAgregarPelicula = (pelicula: Omit<Pelicula, 'id'>) => {
    const newId = Math.max(...peliculas.map(p => p.id), 0) + 1
    setPeliculas([...peliculas, { ...pelicula, id: newId }])
  }

  const handleEditarPelicula = (pelicula: Pelicula) => {
    setPeliculas(peliculas.map(p => p.id === pelicula.id ? pelicula : p))
  }

  const handleEliminarPelicula = (id: number) => {
    setPeliculas(peliculas.filter(p => p.id !== id))
  }

  const handleAgregarLocalidad = (localidad: Omit<Localidad, 'id'>) => {
    const newId = Math.max(...localidades.map(l => l.id), 0) + 1
    setLocalidades([...localidades, { ...localidad, id: newId }])
  }

  const handleEditarLocalidad = (localidad: Localidad) => {
    setLocalidades(localidades.map(l => l.id === localidad.id ? localidad : l))
  }

  const handleEliminarLocalidad = (id: number) => {
    setLocalidades(localidades.filter(l => l.id !== id))
  }

  const handleAgregarSala = (sala: Omit<Sala, 'id'>) => {
    const newId = Math.max(...salas.map(s => s.id), 0) + 1
    setSalas([...salas, { ...sala, id: newId }])
  }

  const handleEditarSala = (sala: Sala) => {
    setSalas(salas.map(s => s.id === sala.id ? sala : s))
  }

  const handleEliminarSala = (id: number) => {
    setSalas(salas.filter(s => s.id !== id))
  }

  const handleAgregarFuncion = (funcion: Omit<Funcion, 'id'>) => {
    const newId = Math.max(...funciones.map(f => f.id), 0) + 1
    setFunciones([...funciones, { ...funcion, id: newId }])
  }

  const handleEditarFuncion = (funcion: Funcion) => {
    setFunciones(funciones.map(f => f.id === funcion.id ? funcion : f))
  }

  const handleEliminarFuncion = (id: number) => {
    setFunciones(funciones.filter(f => f.id !== id))
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
          <AdminLocalidades
            localidades={localidades}
            onAgregar={handleAgregarLocalidad}
            onEditar={handleEditarLocalidad}
            onEliminar={handleEliminarLocalidad}
          />
        )}

        {activeTab === 'salas' && (
          <AdminSalas
            salas={salas}
            localidades={localidades}
            onAgregar={handleAgregarSala}
            onEditar={handleEditarSala}
            onEliminar={handleEliminarSala}
          />
        )}

        {activeTab === 'funciones' && (
          <AdminFunciones
            funciones={funciones}
            peliculas={peliculas}
            salas={salas}
            onAgregar={handleAgregarFuncion}
            onEditar={handleEditarFuncion}
            onEliminar={handleEliminarFuncion}
          />
        )}
      </div>
    </MainLayout>
  )
}

export default PanelAdmin
