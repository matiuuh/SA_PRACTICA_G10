import { useState, useEffect, useCallback } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaStar, FaFire, FaRocket, FaRedo, FaSpinner, FaEye, FaClock, FaCalendarAlt, FaInfoCircle, FaFilm } from 'react-icons/fa'
import type { Pelicula, Categoria, TipoCartelera } from '../../../types/admin.types'
import { peliculasService } from '../../../services/peliculas.service'
import Toast from '../../atoms/Toast/Toast'
interface AdminPeliculasProps {
  peliculas: Pelicula[]
  onAgregar: (pelicula: Pelicula) => void
  onEditar: (pelicula: Pelicula) => void
  onEliminar: (id: string) => void
}

const AdminPeliculas: React.FC<AdminPeliculasProps> = ({ peliculas, onAgregar, onEditar, onEliminar }) => {
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingPelicula, setEditingPelicula] = useState<Pelicula | null>(null)
  const [selectedPelicula, setSelectedPelicula] = useState<Pelicula | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tiposCartelera, setTiposCartelera] = useState<TipoCartelera[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    sinopsis: '',
    duracion_minutos: '',
    poster_url: '',
    id_categoria: '',
    id_tipo_cartelera: '',
    activa: true
  })

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoadingCatalogos(true)
        const [cats, tipos] = await Promise.all([
          peliculasService.getCategorias(),
          peliculasService.getTiposCartelera()
        ])
        
        setCategorias(cats)
        setTiposCartelera(tipos)
        
        if (cats.length > 0 && tipos.length > 0) {
          setFormData(prev => ({
            ...prev,
            id_categoria: cats[0].id_categoria,
            id_tipo_cartelera: tipos[0].id_tipo_cartelera
          }))
        }
      } catch (error) {
        console.error('Error cargando catálogos:', error)
        setErrorMessage('Error al cargar categorías y tipos de cartelera')
        setShowErrorToast(true)
      } finally {
        setLoadingCatalogos(false)
      }
    }
    
    cargarCatalogos()
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }))
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setEditingPelicula(null)
    if (categorias.length > 0 && tiposCartelera.length > 0) {
      setFormData({
        titulo: '',
        sinopsis: '',
        duracion_minutos: '',
        poster_url: '',
        id_categoria: categorias[0]?.id_categoria || '',
        id_tipo_cartelera: tiposCartelera[0]?.id_tipo_cartelera || '',
        activa: true
      })
    }
  }, [categorias, tiposCartelera])

  const handleViewDetails = (pelicula: Pelicula) => {
    setSelectedPelicula(pelicula)
    setShowDetailsModal(true)
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const categoriaId = formData.id_categoria || categorias[0]?.id_categoria || ''
      const tipoCarteleraId = formData.id_tipo_cartelera || tiposCartelera[0]?.id_tipo_cartelera || ''

      if (!categoriaId || !tipoCarteleraId) {
        throw new Error('No hay categorias o tipos de cartelera disponibles para seleccionar')
      }

      const data = {
        titulo: formData.titulo.trim(),
        sinopsis: formData.sinopsis.trim() || undefined,
        duracion_minutos: formData.duracion_minutos ? parseInt(formData.duracion_minutos) : undefined,
        poster_url: formData.poster_url.trim() || undefined,
        id_categoria: categoriaId,
        id_tipo_cartelera: tipoCarteleraId,
        activa: formData.activa
      }
      
      if (editingPelicula) {
        const updated = await peliculasService.updatePelicula(editingPelicula.id_pelicula, data)
        onEditar(updated)
        setSuccessMessage('Película actualizada exitosamente')
      } else {
        const created = await peliculasService.createPelicula(data)
        onAgregar(created)
        setSuccessMessage('Película creada exitosamente')
      }
      setShowSuccessToast(true)
      handleCloseModal()
    } catch (error: any) {
      console.error('Error guardando película:', error)
      setErrorMessage(error.response?.data?.message || 'Error al guardar la película')
      setShowErrorToast(true)
    } finally {
      setIsLoading(false)
    }
  }, [categorias, formData, editingPelicula, onAgregar, onEditar, handleCloseModal, tiposCartelera])

  const handleEdit = useCallback((pelicula: Pelicula) => {
    setEditingPelicula(pelicula)
    setFormData({
      titulo: pelicula.titulo,
      sinopsis: pelicula.sinopsis || '',
      duracion_minutos: pelicula.duracion_minutos?.toString() || '',
      poster_url: pelicula.poster_url || '',
      id_categoria: pelicula.categoria?.id_categoria || categorias[0]?.id_categoria || '',
      id_tipo_cartelera: pelicula.tipoCartelera?.id_tipo_cartelera || tiposCartelera[0]?.id_tipo_cartelera || '',
      activa: pelicula.activa
    })
    setShowModal(true)
  }, [categorias, tiposCartelera])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta película?')) {
      try {
        await peliculasService.deletePelicula(id)
        onEliminar(id)
        setSuccessMessage('Película eliminada exitosamente')
        setShowSuccessToast(true)
      } catch (error: any) {
        setErrorMessage(error.response?.data?.message || 'Error al eliminar la película')
        setShowErrorToast(true)
      }
    }
  }, [onEliminar])

  const getCategoriaIcon = useCallback((categoriaNombre: string) => {
    switch(categoriaNombre?.toLowerCase()) {
      case 'estreno': return <FaFire className="text-cinema-red-500" />
      case 'preventa': return <FaRocket className="text-blue-500" />
      case 're-estreno': return <FaRedo className="text-purple-500" />
      default: return <FaStar />
    }
  }, [])

  const getCategoriaColor = useCallback((categoriaNombre: string) => {
    switch(categoriaNombre?.toLowerCase()) {
      case 'estreno': return 'bg-cinema-red-500/20 text-cinema-red-500'
      case 'preventa': return 'bg-blue-500/20 text-blue-500'
      case 're-estreno': return 'bg-purple-500/20 text-purple-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }, [])

  if (loadingCatalogos) {
    return (
      <div className="cinema-card p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-gold-500"></div>
        </div>
      </div>
    )
  }

  const peliculasFiltradas = searchTerm 
    ? peliculas.filter(p => p.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
    : peliculas

  return (
    <>
      <div className="cinema-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Gestión de Películas</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <FaPlus />
            Agregar Película
          </button>
        </div>

        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-semibold">Título</th>
                <th className="pb-3 text-gray-400 font-semibold">Duración</th>
                <th className="pb-3 text-gray-400 font-semibold">Categoría</th>
                <th className="pb-3 text-gray-400 font-semibold">Tipo Cartelera</th>
                <th className="pb-3 text-gray-400 font-semibold">Estado</th>
                <th className="pb-3 text-gray-400 font-semibold">Acciones</th>
               </tr>
            </thead>
            <tbody>
              {peliculasFiltradas.map((pelicula) => (
                <tr key={pelicula.id_pelicula} className="border-b border-gray-800 hover:bg-white/5">
                  <td className="py-3 text-white">{pelicula.titulo}</td>
                  <td className="py-3 text-gray-400">{pelicula.duracion_minutos ? `${pelicula.duracion_minutos} min` : 'N/A'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getCategoriaColor(pelicula.categoria?.nombre)}`}>
                      {getCategoriaIcon(pelicula.categoria?.nombre)}
                      {pelicula.categoria?.nombre || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{pelicula.tipoCartelera?.nombre || 'N/A'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${pelicula.activa ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {pelicula.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewDetails(pelicula)} className="text-blue-500 hover:text-blue-400" title="Ver detalles">
                        <FaEye />
                      </button>
                      <button onClick={() => handleEdit(pelicula)} className="text-cinema-gold-500 hover:text-cinema-gold-400">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(pelicula.id_pelicula)} className="text-cinema-red-500 hover:text-cinema-red-400">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de detalles */}
        {showDetailsModal && selectedPelicula && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-cinema-dark-800 to-cinema-dark-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cinema-gold-500/30 shadow-2xl">
              <div className="sticky top-0 flex justify-between items-center p-6 border-b border-cinema-gold-500/20 bg-cinema-dark-800/95 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaInfoCircle className="text-cinema-gold-500" />
                  Detalles de la Película
                </h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white transition-colors text-2xl">
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Poster */}
                  {selectedPelicula.poster_url ? (
                    <img 
                      src={selectedPelicula.poster_url} 
                      alt={selectedPelicula.titulo}
                      className="w-40 h-56 object-cover rounded-lg shadow-lg mx-auto md:mx-0"
                    />
                  ) : (
                    <div className="w-40 h-56 bg-cinema-dark-700 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                      <FaFilm className="text-4xl text-gray-500" />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedPelicula.titulo}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getCategoriaColor(selectedPelicula.categoria?.nombre)}`}>
                          {getCategoriaIcon(selectedPelicula.categoria?.nombre)}
                          {selectedPelicula.categoria?.nombre || 'N/A'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-cinema-dark-700 text-gray-300">
                          {selectedPelicula.tipoCartelera?.nombre || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaClock className="text-cinema-gold-500" />
                        <span>{selectedPelicula.duracion_minutos ? `${selectedPelicula.duracion_minutos} minutos` : 'Duración no especificada'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaCalendarAlt className="text-cinema-gold-500" />
                        <span className={selectedPelicula.activa ? 'text-green-500' : 'text-red-500'}>
                          {selectedPelicula.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Sinopsis</label>
                      <p className="text-gray-300 leading-relaxed">
                        {selectedPelicula.sinopsis || 'Sin sinopsis disponible'}
                      </p>
                    </div>
                    
                    {selectedPelicula.poster_url && (
                      <div>
                        <label className="text-gray-400 text-sm block mb-2">URL del Poster</label>
                        <a 
                          href={selectedPelicula.poster_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cinema-gold-500 hover:underline text-sm break-all"
                        >
                          {selectedPelicula.poster_url}
                        </a>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">ID</label>
                      <p className="text-gray-500 text-sm font-mono">{selectedPelicula.id_pelicula}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 p-6 border-t border-cinema-gold-500/20 bg-cinema-dark-800/95 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEdit(selectedPelicula)
                  }}
                  className="px-4 py-2 rounded-lg bg-cinema-gold-500 text-black hover:bg-cinema-gold-400 transition-all flex items-center gap-2"
                >
                  <FaEdit /> Editar
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de agregar/editar película */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-cinema-dark-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cinema-gold-500/30">
              <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
                <h2 className="text-xl font-bold text-white">
                  {editingPelicula ? 'Editar Película' : 'Nueva Película'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    required
                    value={formData.titulo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Duración (minutos)</label>
                    <input
                      type="number"
                      name="duracion_minutos"
                      value={formData.duracion_minutos}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">URL del Poster</label>
                    <input
                      type="text"
                      name="poster_url"
                      value={formData.poster_url}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Categoría *</label>
                    <select
                      name="id_categoria"
                      required
                      value={formData.id_categoria}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                    >
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Tipo Cartelera *</label>
                    <select
                      name="id_tipo_cartelera"
                      required
                      value={formData.id_tipo_cartelera}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                    >
                      {tiposCartelera.map(tipo => (
                        <option key={tipo.id_tipo_cartelera} value={tipo.id_tipo_cartelera}>{tipo.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Sinopsis</label>
                  <textarea
                    name="sinopsis"
                    rows={4}
                    value={formData.sinopsis}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="activa"
                    checked={formData.activa}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-700 bg-cinema-dark-900/50"
                  />
                  <label className="text-gray-300 text-sm">Activa</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <FaSpinner className="animate-spin mx-auto" />
                    ) : (
                      editingPelicula ? 'Actualizar' : 'Crear'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {showSuccessToast && (
        <Toast message={successMessage} type="success" onClose={() => setShowSuccessToast(false)} />
      )}
      {showErrorToast && (
        <Toast message={errorMessage} type="error" onClose={() => setShowErrorToast(false)} />
      )}
    </>
  )
}

export default AdminPeliculas