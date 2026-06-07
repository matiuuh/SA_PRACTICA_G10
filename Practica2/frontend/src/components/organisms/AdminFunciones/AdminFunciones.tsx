import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import type { Funcion, Pelicula, Sala } from '../../../types/admin.types'

interface AdminFuncionesProps {
  funciones: Funcion[]
  peliculas: Pelicula[]
  salas: Sala[]
  onAgregar: (funcion: Omit<Funcion, 'id'>) => void
  onEditar: (funcion: Funcion) => void
  onEliminar: (id: number) => void
}

const AdminFunciones: React.FC<AdminFuncionesProps> = ({ 
  funciones, 
  peliculas, 
  salas, 
  onAgregar, 
  onEditar, 
  onEliminar 
}) => {
  const [showModal, setShowModal] = useState(false)
  const [editingFuncion, setEditingFuncion] = useState<Funcion | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    peliculaId: 0,
    salaId: 0,
    fecha: '',
    horario: '',
    precio: 45
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'precio' ? parseInt(value) : value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pelicula = peliculas.find(p => p.id === formData.peliculaId)
    const sala = salas.find(s => s.id === formData.salaId)
    
    const nuevaFuncion = {
      peliculaId: formData.peliculaId,
      peliculaNombre: pelicula?.titulo || '',
      salaId: formData.salaId,
      salaNombre: sala?.nombre || '',
      localidadNombre: sala?.localidadNombre || '',
      fecha: formData.fecha,
      horario: formData.horario,
      precio: formData.precio
    }
    
    if (editingFuncion) {
      onEditar({ ...editingFuncion, ...nuevaFuncion })
    } else {
      onAgregar(nuevaFuncion)
    }
    handleCloseModal()
  }

  const handleEdit = (funcion: Funcion) => {
    setEditingFuncion(funcion)
    setFormData({
      peliculaId: funcion.peliculaId,
      salaId: funcion.salaId,
      fecha: funcion.fecha,
      horario: funcion.horario,
      precio: funcion.precio
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingFuncion(null)
    setFormData({
      peliculaId: 0,
      salaId: 0,
      fecha: '',
      horario: '',
      precio: 45
    })
  }

  const funcionesFiltradas = funciones.filter(f => 
    f.peliculaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.localidadNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.salaNombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="cinema-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gestión de Funciones</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <FaPlus />
          Agregar Función
        </button>
      </div>

      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por película, cine o sala..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 text-gray-400 font-semibold">Película</th>
              <th className="pb-3 text-gray-400 font-semibold">Cine</th>
              <th className="pb-3 text-gray-400 font-semibold">Sala</th>
              <th className="pb-3 text-gray-400 font-semibold">Fecha</th>
              <th className="pb-3 text-gray-400 font-semibold">Horario</th>
              <th className="pb-3 text-gray-400 font-semibold">Precio</th>
              <th className="pb-3 text-gray-400 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {funcionesFiltradas.map((funcion) => (
              <tr key={funcion.id} className="border-b border-gray-800 hover:bg-white/5">
                <td className="py-3 text-white">{funcion.peliculaNombre}</td>
                <td className="py-3 text-gray-400">{funcion.localidadNombre}</td>
                <td className="py-3 text-gray-400">{funcion.salaNombre}</td>
                <td className="py-3 text-gray-400">{funcion.fecha}</td>
                <td className="py-3 text-gray-400">{funcion.horario}</td>
                <td className="py-3 text-cinema-gold-500">Q{funcion.precio}</td>
                <td className="py-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(funcion)} className="text-cinema-gold-500 hover:text-cinema-gold-400">
                      <FaEdit />
                    </button>
                    <button onClick={() => onEliminar(funcion.id)} className="text-cinema-red-500 hover:text-cinema-red-400">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
            <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
              <h2 className="text-xl font-bold text-white">
                {editingFuncion ? 'Editar Función' : 'Nueva Función'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Película</label>
                <select
                  name="peliculaId"
                  required
                  value={formData.peliculaId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value={0}>Seleccionar película</option>
                  {peliculas.map(pelicula => (
                    <option key={pelicula.id} value={pelicula.id}>{pelicula.titulo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Sala</label>
                <select
                  name="salaId"
                  required
                  value={formData.salaId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value={0}>Seleccionar sala</option>
                  {salas.map(sala => (
                    <option key={sala.id} value={sala.id}>{sala.nombre} - {sala.localidadNombre} ({sala.tipo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  required
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Horario</label>
                <select
                  name="horario"
                  required
                  value={formData.horario}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value="">Seleccionar horario</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:45">5:45 PM</option>
                  <option value="18:30">6:30 PM</option>
                  <option value="19:15">7:15 PM</option>
                  <option value="20:30">8:30 PM</option>
                  <option value="21:00">9:00 PM</option>
                  <option value="22:00">10:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Precio (Q)</label>
                <input
                  type="number"
                  name="precio"
                  required
                  min={20}
                  max={200}
                  value={formData.precio}
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
                  {editingFuncion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminFunciones
