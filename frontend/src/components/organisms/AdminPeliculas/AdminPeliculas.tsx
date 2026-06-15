import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FaPlus, FaSearch, FaStar, FaFire, FaRocket, FaRedo, FaSpinner, FaClock, FaCalendarAlt, FaInfoCircle, FaFilm, FaUpload, FaChevronLeft, FaChevronRight, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTrash } from 'react-icons/fa'
import type { Pelicula, Categoria, TipoCartelera, PeliculasPaginationMeta } from '../../../types/admin.types'
import { peliculasService } from '../../../services/peliculas.service'
import AdminActionButtons from '../../admin/AdminActionButtons'
import Toast from '../../atoms/Toast/Toast'
import ConfirmDialog from '../AdminLocalidades/ConfirmDialog'
interface AdminPeliculasProps {
  peliculas: Pelicula[]
  onAgregar: (pelicula: Pelicula) => void
  onEditar: (pelicula: Pelicula) => void
  onEliminar: (id: string) => void
  onImportar?: () => Promise<void>
}

const AdminPeliculas: React.FC<AdminPeliculasProps> = ({ peliculas, onAgregar, onEditar, onEliminar, onImportar }) => {
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState<'individual' | 'masiva'>('individual')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingPelicula, setEditingPelicula] = useState<Pelicula | null>(null)
  const [selectedPelicula, setSelectedPelicula] = useState<Pelicula | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tiposCartelera, setTiposCartelera] = useState<TipoCartelera[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  const [loadingPeliculas, setLoadingPeliculas] = useState(false)
  const [isUploadingCsv, setIsUploadingCsv] = useState(false)
  const [csvDragOver, setCsvDragOver] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreviewRows, setCsvPreviewRows] = useState<string[][]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvParseError, setCsvParseError] = useState<string | null>(null)
  const [csvImportResult, setCsvImportResult] = useState<{ insertadas: number; fallidas: number; errores: Array<{ fila: number; error: string }> } | null>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [peliculaToDelete, setPeliculaToDelete] = useState<Pelicula | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [peliculasPagina, setPeliculasPagina] = useState<Pelicula[]>([])
  const [paginationMeta, setPaginationMeta] = useState<PeliculasPaginationMeta>({
    page: 1,
    limit: 10,
    total: peliculas.length,
    totalPages: Math.max(1, Math.ceil(peliculas.length / 10)),
  })
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

  useEffect(() => {
    const cargarPeliculasPaginadas = async () => {
      try {
        setLoadingPeliculas(true)
        const response = await peliculasService.getPeliculasPaginated({
          page: paginaActual,
          limit: 10,
          search: searchTerm.trim() || undefined,
        })

        setPeliculasPagina(response.data)
        setPaginationMeta({
          ...response.meta,
          totalPages: Math.max(1, response.meta.totalPages),
        })
      } catch (error: any) {
        console.error('Error cargando peliculas paginadas:', error)
        setErrorMessage(error.response?.data?.message || 'Error al cargar peliculas')
        setShowErrorToast(true)
      } finally {
        setLoadingPeliculas(false)
      }
    }

    void cargarPeliculasPaginadas()
  }, [paginaActual, searchTerm, reloadKey])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }))
  }, [])

  const resetCsvState = useCallback(() => {
    setCsvFile(null)
    setCsvPreviewRows([])
    setCsvHeaders([])
    setCsvParseError(null)
    setCsvImportResult(null)
    if (csvInputRef.current) csvInputRef.current.value = ''
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setEditingPelicula(null)
    setModalTab('individual')
    resetCsvState()
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
  }, [categorias, tiposCartelera, resetCsvState])

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
        setReloadKey(prev => prev + 1)
        setSuccessMessage('Película actualizada exitosamente')
      } else {
        const created = await peliculasService.createPelicula(data)
        onAgregar(created)
        setReloadKey(prev => prev + 1)
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

  const handleDelete = useCallback(async () => {
    if (!peliculaToDelete) {
      return
    }

    setIsDeleting(true)

    try {
      await peliculasService.deletePelicula(peliculaToDelete.id_pelicula)
      onEliminar(peliculaToDelete.id_pelicula)
      setReloadKey(prev => prev + 1)
      setSuccessMessage('Película eliminada exitosamente')
      setShowSuccessToast(true)
      setPeliculaToDelete(null)
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Error al eliminar la película')
      setShowErrorToast(true)
    } finally {
      setIsDeleting(false)
    }
  }, [onEliminar, peliculaToDelete])

  const parseCsvForPreview = useCallback((file: File) => {
    resetCsvState()
    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text || !text.trim()) {
        setCsvParseError('El archivo está vacío.')
        return
      }
      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
      if (lines.length < 2) {
        setCsvParseError('El archivo no contiene filas de datos (solo encabezado o vacío).')
        return
      }
      const parseRow = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const ch = line[i]
          if (ch === '"') {
            inQuotes = !inQuotes
          } else if (ch === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += ch
          }
        }
        result.push(current.trim())
        return result
      }
      const headers = parseRow(lines[0])
      const requiredCols = ['titulo']
      const missing = requiredCols.filter(col => !headers.includes(col))
      if (missing.length > 0) {
        setCsvParseError(`Columnas obligatorias faltantes: ${missing.join(', ')}. Encabezados encontrados: ${headers.join(', ')}`)
        return
      }
      const dataRows = lines.slice(1).filter(l => l.trim()).map(parseRow)
      setCsvHeaders(headers)
      setCsvPreviewRows(dataRows)
    }
    reader.onerror = () => setCsvParseError('No se pudo leer el archivo.')
    reader.readAsText(file, 'UTF-8')
  }, [resetCsvState])

  const handleCsvFileSelect = useCallback((file: File | undefined | null) => {
    if (!file) return
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      resetCsvState()
      setCsvParseError('Solo se aceptan archivos .csv')
      return
    }
    parseCsvForPreview(file)
  }, [parseCsvForPreview, resetCsvState])

  const handleCsvInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleCsvFileSelect(event.target.files?.[0])
    event.target.value = ''
  }, [handleCsvFileSelect])

  const handleCsvDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setCsvDragOver(false)
    handleCsvFileSelect(event.dataTransfer.files?.[0])
  }, [handleCsvFileSelect])

  const handleConfirmCsvUpload = useCallback(async () => {
    if (!csvFile) return
    setIsUploadingCsv(true)
    setCsvImportResult(null)
    try {
      const result = await peliculasService.importCsv(csvFile)
      setCsvImportResult(result)
      if (result.errores.length === 0) {
        setSuccessMessage(`Carga exitosa: ${result.insertadas} película${result.insertadas !== 1 ? 's' : ''} importada${result.insertadas !== 1 ? 's' : ''}`)
        setShowSuccessToast(true)
      } else if (result.insertadas > 0) {
        setSuccessMessage(`Carga parcial: ${result.insertadas} insertada${result.insertadas !== 1 ? 's' : ''}, ${result.fallidas} fallida${result.fallidas !== 1 ? 's' : ''}. Revisa el detalle.`)
        setShowSuccessToast(true)
      } else {
        setErrorMessage('No se insertó ninguna película. Revisa el detalle del CSV.')
        setShowErrorToast(true)
      }
      setPaginaActual(1)
      setReloadKey(prev => prev + 1)
      onImportar?.().catch((refreshError) => {
        console.error('Error refrescando peliculas tras importar CSV:', refreshError)
      })
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al cargar el archivo CSV'
      setCsvImportResult({ insertadas: 0, fallidas: 0, errores: [{ fila: 0, error: msg }] })
      setErrorMessage(msg)
      setShowErrorToast(true)
    } finally {
      setIsUploadingCsv(false)
    }
  }, [csvFile, onImportar])

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

  const peliculasFiltradas = peliculasPagina
  const totalPaginas = paginationMeta.totalPages || 1

  return (
    <>
      <div className="cinema-card p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
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
            onChange={(e) => {
              setPaginaActual(1)
              setSearchTerm(e.target.value)
            }}
            className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
          />
        </div>

        <div className="mb-4 text-sm text-gray-400">
          Mostrando {peliculasFiltradas.length} de {paginationMeta.total} peliculas
        </div>

        {loadingPeliculas && (
          <div className="flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-cinema-gold-500 text-3xl" />
          </div>
        )}

        {!loadingPeliculas && (
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
                    <AdminActionButtons
                      onView={() => handleViewDetails(pelicula)}
                      onEdit={() => handleEdit(pelicula)}
                      onDelete={() => setPeliculaToDelete(pelicula)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {!loadingPeliculas && peliculasFiltradas.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No hay peliculas para mostrar.
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Pagina {paginationMeta.page} de {totalPaginas}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
              disabled={paginaActual <= 1 || loadingPeliculas}
              className="px-3 py-2 rounded-lg bg-cinema-dark-800 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaChevronLeft />
              Anterior
            </button>
            <button
              onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual >= totalPaginas || loadingPeliculas}
              className="px-3 py-2 rounded-lg bg-cinema-dark-800 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Siguiente
              <FaChevronRight />
            </button>
          </div>
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
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 p-6 border-t border-cinema-gold-500/20 bg-cinema-dark-800/95 flex justify-end gap-3">
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

              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
                <h2 className="text-xl font-bold text-white">
                  {editingPelicula ? 'Editar Película' : 'Agregar Película'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white text-2xl leading-none">
                  ✕
                </button>
              </div>

              {/* Tabs — only show when adding, not editing */}
              {!editingPelicula && (
                <div className="flex border-b border-gray-700 px-6">
                  <button
                    onClick={() => setModalTab('individual')}
                    className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                      modalTab === 'individual'
                        ? 'border-cinema-gold-500 text-cinema-gold-500'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Película individual
                  </button>
                  <button
                    onClick={() => setModalTab('masiva')}
                    className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                      modalTab === 'masiva'
                        ? 'border-cinema-gold-500 text-cinema-gold-500'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Carga masiva (CSV)
                  </button>
                </div>
              )}

              {/* Tab: Individual */}
              {(modalTab === 'individual' || editingPelicula) && (
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
              )}

              {/* Tab: Carga masiva */}
              {modalTab === 'masiva' && !editingPelicula && (
                <div className="p-6 space-y-5">

                  {/* Resultado final — se muestra tras confirmar la carga */}
                  {csvImportResult && (
                    <div className={`rounded-xl border p-5 ${
                      csvImportResult.errores.length === 0
                        ? 'bg-green-500/10 border-green-500/40'
                        : csvImportResult.insertadas > 0
                          ? 'bg-yellow-500/10 border-yellow-500/40'
                          : 'bg-red-500/10 border-red-500/40'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {csvImportResult.errores.length === 0
                          ? <FaCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                          : csvImportResult.insertadas > 0
                            ? <FaExclamationTriangle className="text-yellow-400 text-xl flex-shrink-0" />
                            : <FaTimesCircle className="text-red-400 text-xl flex-shrink-0" />
                        }
                        <p className="text-white font-semibold">
                          {csvImportResult.errores.length === 0
                            ? `¡Carga exitosa! ${csvImportResult.insertadas} película${csvImportResult.insertadas !== 1 ? 's' : ''} importada${csvImportResult.insertadas !== 1 ? 's' : ''}.`
                            : csvImportResult.insertadas > 0
                              ? `Carga parcial: ${csvImportResult.insertadas} insertada${csvImportResult.insertadas !== 1 ? 's' : ''}, ${csvImportResult.fallidas} fallida${csvImportResult.fallidas !== 1 ? 's' : ''}.`
                              : `Error: no se pudo insertar ninguna película.`
                          }
                        </p>
                      </div>
                      {csvImportResult.errores.length > 0 && (
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                          {csvImportResult.errores.map((e, i) => (
                            <p key={i} className="text-red-300 text-xs font-mono">
                              {e.fila > 0 ? `Fila ${e.fila}: ` : ''}{e.error}
                            </p>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={resetCsvState}
                        className="mt-4 text-sm text-gray-400 hover:text-white underline"
                      >
                        Cargar otro archivo
                      </button>
                    </div>
                  )}

                  {/* Paso 1: Seleccionar archivo (solo si no hay resultado aún) */}
                  {!csvImportResult && (
                    <>
                      {/* Formato info */}
                      <div className="bg-cinema-dark-900/60 border border-cinema-gold-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaInfoCircle className="text-cinema-gold-500 flex-shrink-0" />
                          <span className="text-cinema-gold-500 font-semibold text-sm">Formato requerido</span>
                        </div>
                        <div className="bg-cinema-dark-900 rounded-lg px-3 py-2 font-mono text-xs text-cinema-gold-500 overflow-x-auto whitespace-nowrap border border-gray-700">
                          titulo,sinopsis,duracion_minutos,poster_url,categoria,tipo_cartelera,activa
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Categorías válidas:
                          <span className="text-cinema-gold-400"> {categorias.map(c => c.nombre).join(', ')}</span>
                          {' · '}Tipo cartelera:
                          <span className="text-cinema-gold-400"> {tiposCartelera.map(t => t.nombre).join(', ')}</span>
                        </p>
                      </div>

                      {/* Drop zone */}
                      {!csvFile && (
                        <label
                          htmlFor="csv-upload"
                          onDragOver={(e) => { e.preventDefault(); setCsvDragOver(true) }}
                          onDragLeave={() => setCsvDragOver(false)}
                          onDrop={handleCsvDrop}
                          className={`flex flex-col items-center justify-center gap-3 w-full rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all ${
                            csvDragOver
                              ? 'border-cinema-gold-500 bg-cinema-gold-500/10'
                              : 'border-gray-600 hover:border-cinema-gold-500/60 hover:bg-cinema-dark-900/40'
                          }`}
                        >
                          <div className="w-14 h-14 rounded-full bg-cinema-dark-900 border border-gray-600 flex items-center justify-center">
                            <FaUpload className="text-cinema-gold-500 text-xl" />
                          </div>
                          <div className="text-center">
                            <p className="text-white font-semibold">Arrastra tu archivo aquí</p>
                            <p className="text-gray-400 text-sm mt-1">o haz clic para seleccionarlo</p>
                          </div>
                          <span className="text-xs text-gray-500 bg-cinema-dark-900 border border-gray-700 rounded-full px-3 py-1">
                            Solo archivos .csv
                          </span>
                          <input
                            id="csv-upload"
                            ref={csvInputRef}
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={handleCsvInputChange}
                          />
                        </label>
                      )}

                      {/* Error de parseo */}
                      {csvParseError && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/40 rounded-xl p-4">
                          <FaTimesCircle className="text-red-400 text-lg flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-red-300 font-semibold text-sm">Archivo inválido</p>
                            <p className="text-red-300/80 text-xs mt-1">{csvParseError}</p>
                            <button onClick={resetCsvState} className="mt-2 text-xs text-gray-400 hover:text-white underline">Intentar con otro archivo</button>
                          </div>
                        </div>
                      )}

                      {/* Preview */}
                      {csvFile && csvPreviewRows.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FaCheckCircle className="text-green-400" />
                              <span className="text-white font-semibold text-sm">{csvFile.name}</span>
                              <span className="text-gray-400 text-xs">({csvPreviewRows.length} fila{csvPreviewRows.length !== 1 ? 's' : ''})</span>
                            </div>
                            <button
                              onClick={resetCsvState}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                              title="Quitar archivo"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>

                          <div className="overflow-x-auto rounded-lg border border-gray-700 max-h-52">
                            <table className="w-full text-xs">
                              <thead className="sticky top-0 bg-cinema-dark-900">
                                <tr>
                                  <th className="px-2 py-2 text-gray-500 font-medium text-left w-8">#</th>
                                  {csvHeaders.map((h, i) => (
                                    <th key={i} className="px-3 py-2 text-cinema-gold-400 font-medium text-left whitespace-nowrap">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {csvPreviewRows.slice(0, 10).map((row, ri) => (
                                  <tr key={ri} className="border-t border-gray-800 hover:bg-white/5">
                                    <td className="px-2 py-1.5 text-gray-600">{ri + 1}</td>
                                    {csvHeaders.map((_, ci) => (
                                      <td key={ci} className="px-3 py-1.5 text-gray-300 max-w-[160px] truncate" title={row[ci] ?? ''}>
                                        {row[ci] ?? <span className="text-gray-600 italic">—</span>}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {csvPreviewRows.length > 10 && (
                              <p className="text-center text-xs text-gray-500 py-2 border-t border-gray-800">
                                Mostrando 10 de {csvPreviewRows.length} filas
                              </p>
                            )}
                          </div>

                          {/* Confirmar */}
                          <div className="flex gap-3 pt-1">
                            <button
                              type="button"
                              onClick={handleCloseModal}
                              className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 transition-all"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleConfirmCsvUpload()}
                              disabled={isUploadingCsv}
                              className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                            >
                              {isUploadingCsv ? (
                                <><FaSpinner className="animate-spin" /> Importando...</>
                              ) : (
                                <><FaUpload /> Confirmar carga ({csvPreviewRows.length} filas)</>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Cancelar cuando no hay preview */}
                      {!csvFile && !csvParseError && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-6 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Cerrar tras resultado */}
                  {csvImportResult && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-6 py-2 rounded-lg bg-cinema-dark-700 text-gray-300 hover:bg-cinema-dark-600 transition-all"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}

                </div>
              )}

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
      <ConfirmDialog
        isOpen={peliculaToDelete !== null}
        onClose={() => setPeliculaToDelete(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar Pelicula"
        message={`Estas seguro que deseas eliminar "${peliculaToDelete?.titulo}"? Esta accion no se puede deshacer.`}
        isLoading={isDeleting}
        loadingLabel="Eliminando..."
      />
    </>
  )
}

export default AdminPeliculas
