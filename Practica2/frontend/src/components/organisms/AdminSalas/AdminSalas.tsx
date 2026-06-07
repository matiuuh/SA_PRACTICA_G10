import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTheaterMasks, FaCouch } from 'react-icons/fa'
import type { Localidad, Sala } from '../../../types/admin.types'

interface AdminSalasProps {
  salas: Sala[]
  localidades: Localidad[]
  onAgregar: (sala: Omit<Sala, 'id'>) => void
  onEditar: (sala: Sala) => void
  onEliminar: (id: number) => void
}

const AdminSalas: React.FC<AdminSalasProps> = ({ salas, localidades, onAgregar, onEditar, onEliminar }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingSala, setEditingSala] = useState<Sala | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    localidadId: 0,
    nombre: '',
    capacidad: 100,
    tipo: 'normal' as Sala['tipo']
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'capacidad' ? parseInt(value) : value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const localidad = localidades.find(l => l.id === formData.localidadId)
    
    const nuevaSala = {
      localidadId: formData.localidadId,
      localidadNombre: localidad?.cine || '',
      nombre: formData.nombre,
      capacidad: formData.capacidad,
      tipo: formData.tipo
    }
    
    if (editingSala) {
      onEditar({ ...editingSala, ...nuevaSala })
    } else {
      onAgregar(nuevaSala)
    }
    handleCloseModal()
  }

  const handleEdit = (sala: Sala) => {
    setEditingSala(sala)
    setFormData({
      localidadId: sala.localidadId,
      nombre: sala.nombre,
      capacidad: sala.capacidad,
      tipo: sala.tipo
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSala(null)
    setFormData({
      localidadId: 0,
      nombre: '',
      capacidad: 100,
      tipo: 'normal' as Sala['tipo']
    })
  }

  const getTipoIcon = (tipo: string) => {
    switch(tipo) {
      case 'normal': return <FaTheaterMasks className="text-gray-500" />
      case 'premium': return <FaCouch className="text-cinema-gold-500" />
      case 'vip': return <FaCouch className="text-purple-500" />
      default: return <FaTheaterMasks />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'normal': return 'bg-gray-500/20 text-gray-500'
      case 'premium': return 'bg-cinema-gold-500/20 text-cinema-gold-500'
      case 'vip': return 'bg-purple-500/20 text-purple-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const salasFiltradas = salas.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.localidadNombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="cinema-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gestión de Salas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <FaPlus />
          Agregar Sala
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre de sala o cine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
        />
      </div>

      {/* Grid de salas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salasFiltradas.map((sala) => (
          <div key={sala.id} className="bg-cinema-dark-900/50 rounded-lg p-4 border border-cinema-gold-500/20 hover:border-cinema-gold-500/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {getTipoIcon(sala.tipo)}
                <h3 className="font-bold text-white">{sala.nombre}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(sala)} className="text-cinema-gold-500 hover:text-cinema-gold-400">
                  <FaEdit />
                </button>
                <button onClick={() => onEliminar(sala.id)} className="text-cinema-red-500 hover:text-cinema-red-400">
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="text-gray-400 text-sm mb-2">
              Cine: {sala.localidadNombre}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Capacidad:</span>
                <span className="text-cinema-gold-500 font-bold">{sala.capacidad} asientos</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getTipoColor(sala.tipo)}`}>
                {sala.tipo === 'normal' ? 'Normal' : sala.tipo === 'premium' ? 'Premium' : 'VIP'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de agregar/editar sala */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
            <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
              <h2 className="text-xl font-bold text-white">
                {editingSala ? 'Editar Sala' : 'Nueva Sala'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Cine / Localidad</label>
                <select
                  name="localidadId"
                  required
                  value={formData.localidadId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value={0}>Seleccionar cine</option>
                  {localidades.map(localidad => (
                    <option key={localidad.id} value={localidad.id}>{localidad.cine} - {localidad.ciudad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Nombre de la Sala</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej: Sala 1, Sala Premium, Sala IMAX..."
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Tipo de Sala</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Capacidad (asientos)</label>
                <input
                  type="number"
                  name="capacidad"
                  required
                  min={1}
                  max={500}
                  value={formData.capacidad}
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
                  {editingSala ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSalas
