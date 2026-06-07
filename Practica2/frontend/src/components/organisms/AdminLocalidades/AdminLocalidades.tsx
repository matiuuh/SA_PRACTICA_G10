import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCity, FaTheaterMasks, FaMapMarkerAlt } from 'react-icons/fa'
import type { Localidad } from '../../../types/admin.types'

interface AdminLocalidadesProps {
  localidades: Localidad[]
  onAgregar: (localidad: Omit<Localidad, 'id'>) => void
  onEditar: (localidad: Localidad) => void
  onEliminar: (id: number) => void
}

const AdminLocalidades: React.FC<AdminLocalidadesProps> = ({ localidades, onAgregar, onEditar, onEliminar }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingLocalidad, setEditingLocalidad] = useState<Localidad | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    ciudad: '',
    cine: '',
    direccion: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingLocalidad) {
      onEditar({ ...editingLocalidad, ...formData })
    } else {
      onAgregar(formData)
    }
    handleCloseModal()
  }

  const handleEdit = (localidad: Localidad) => {
    setEditingLocalidad(localidad)
    setFormData({
      ciudad: localidad.ciudad,
      cine: localidad.cine,
      direccion: localidad.direccion
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingLocalidad(null)
    setFormData({
      ciudad: '',
      cine: '',
      direccion: ''
    })
  }

  const localidadesFiltradas = localidades.filter(l => 
    l.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.cine.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="cinema-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gestión de Localidades (Cines)</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <FaPlus />
          Agregar Cine
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por ciudad o cine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
        />
      </div>

      {/* Grid de localidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localidadesFiltradas.map((localidad) => (
          <div key={localidad.id} className="bg-cinema-dark-900/50 rounded-lg p-4 border border-cinema-gold-500/20 hover:border-cinema-gold-500/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <FaCity className="text-cinema-gold-500" />
                <h3 className="font-bold text-white">{localidad.ciudad}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(localidad)} className="text-cinema-gold-500 hover:text-cinema-gold-400">
                  <FaEdit />
                </button>
                <button onClick={() => onEliminar(localidad.id)} className="text-cinema-red-500 hover:text-cinema-red-400">
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaTheaterMasks />
              <span>{localidad.cine}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FaMapMarkerAlt />
              <span>{localidad.direccion}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de agregar/editar localidad */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
            <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
              <h2 className="text-xl font-bold text-white">
                {editingLocalidad ? 'Editar Cine' : 'Nuevo Cine'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  required
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Nombre del Cine</label>
                <input
                  type="text"
                  name="cine"
                  required
                  value={formData.cine}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  required
                  value={formData.direccion}
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
                  {editingLocalidad ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLocalidades
