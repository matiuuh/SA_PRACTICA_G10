import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaStar, FaFire, FaRocket, FaRedo } from 'react-icons/fa'
import type { Pelicula } from '../../../types/admin.types'

interface AdminPeliculasProps {
  peliculas: Pelicula[]
  onAgregar: (pelicula: Omit<Pelicula, 'id'>) => void
  onEditar: (pelicula: Pelicula) => void
  onEliminar: (id: number) => void
}

const AdminPeliculas: React.FC<AdminPeliculasProps> = ({ peliculas, onAgregar, onEditar, onEliminar }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingPelicula, setEditingPelicula] = useState<Pelicula | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    genero: '',
    duracion: '',
    clasificacion: '',
    sinopsis: '',
    categoria: 'estreno' as Pelicula['categoria'],
    imagen: '',
    fechaEstreno: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPelicula) {
      onEditar({ ...editingPelicula, ...formData })
    } else {
      onAgregar(formData)
    }
    handleCloseModal()
  }

  const handleEdit = (pelicula: Pelicula) => {
    setEditingPelicula(pelicula)
    setFormData({
      titulo: pelicula.titulo,
      genero: pelicula.genero,
      duracion: pelicula.duracion,
      clasificacion: pelicula.clasificacion,
      sinopsis: pelicula.sinopsis,
      categoria: pelicula.categoria,
      imagen: pelicula.imagen,
      fechaEstreno: pelicula.fechaEstreno
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPelicula(null)
    setFormData({
      titulo: '',
      genero: '',
      duracion: '',
      clasificacion: '',
      sinopsis: '',
      categoria: 'estreno' as Pelicula['categoria'],
      imagen: '',
      fechaEstreno: ''
    })
  }

  const getCategoriaIcon = (categoria: string) => {
    switch(categoria) {
      case 'estreno': return <FaFire className="text-cinema-red-500" />
      case 'preventa': return <FaRocket className="text-blue-500" />
      case 'reestreno': return <FaRedo className="text-purple-500" />
      default: return <FaStar />
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch(categoria) {
      case 'estreno': return 'bg-cinema-red-500/20 text-cinema-red-500'
      case 'preventa': return 'bg-blue-500/20 text-blue-500'
      case 'reestreno': return 'bg-purple-500/20 text-purple-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const peliculasFiltradas = peliculas.filter(p => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.genero.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
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

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por título o género..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
        />
      </div>

      {/* Tabla de películas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 text-gray-400 font-semibold">Título</th>
              <th className="pb-3 text-gray-400 font-semibold">Género</th>
              <th className="pb-3 text-gray-400 font-semibold">Duración</th>
              <th className="pb-3 text-gray-400 font-semibold">Clasificación</th>
              <th className="pb-3 text-gray-400 font-semibold">Categoría</th>
              <th className="pb-3 text-gray-400 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {peliculasFiltradas.map((pelicula) => (
              <tr key={pelicula.id} className="border-b border-gray-800 hover:bg-white/5">
                <td className="py-3 text-white">{pelicula.titulo}</td>
                <td className="py-3 text-gray-400">{pelicula.genero}</td>
                <td className="py-3 text-gray-400">{pelicula.duracion}</td>
                <td className="py-3 text-gray-400">{pelicula.clasificacion}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getCategoriaColor(pelicula.categoria)}`}>
                    {getCategoriaIcon(pelicula.categoria)}
                    {pelicula.categoria === 'estreno' ? 'Estreno' : pelicula.categoria === 'preventa' ? 'Pre-venta' : 'Re-Estreno'}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <FaEye />
                    </button>
                    <button onClick={() => handleEdit(pelicula)} className="text-cinema-gold-500 hover:text-cinema-gold-400">
                      <FaEdit />
                    </button>
                    <button onClick={() => onEliminar(pelicula.id)} className="text-cinema-red-500 hover:text-cinema-red-400">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <label className="block text-gray-300 text-sm mb-2">Título</label>
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
                  <label className="block text-gray-300 text-sm mb-2">Género</label>
                  <input
                    type="text"
                    name="genero"
                    required
                    value={formData.genero}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Duración</label>
                  <input
                    type="text"
                    name="duracion"
                    placeholder="Ej: 2h 30min"
                    required
                    value={formData.duracion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Clasificación</label>
                  <select
                    name="clasificacion"
                    value={formData.clasificacion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  >
                    <option value="G">G - General</option>
                    <option value="PG">PG - Guía paternal</option>
                    <option value="PG-13">PG-13 - Mayores de 13</option>
                    <option value="R">R - Restringido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  >
                    <option value="estreno">Estreno</option>
                    <option value="preventa">Pre-venta</option>
                    <option value="reestreno">Re-Estreno</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Fecha de Estreno</label>
                <input
                  type="date"
                  name="fechaEstreno"
                  required
                  value={formData.fechaEstreno}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
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
                  className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600"
                >
                  {editingPelicula ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPeliculas
