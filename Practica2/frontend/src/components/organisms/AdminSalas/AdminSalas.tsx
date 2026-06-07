import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTheaterMasks, FaCouch } from 'react-icons/fa'
import { localidadesService } from '../../../services/localidades.service'
import type { Cine, Sala } from '../../../types/localidades.types'

const AdminSalas = () => {
  const [cines, setCines] = useState<Cine[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingSala, setEditingSala] = useState<Sala | null>(null)
  const [form, setForm] = useState({ nombre: '', capacidad: 100, tipoSala: '', idCine: '' })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      const cinesData = await localidadesService.getCines()
      setCines(cinesData)

      const salasData = await Promise.all(
        cinesData.map(c => localidadesService.getSalasByCine(c.id))
      )
      setSalas(salasData.flat())
    } catch {
      setError('Error al cargar los datos. Verifica que el servicio esté activo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingSala) {
        const updated = await localidadesService.updateSala(editingSala.id, {
          nombre: form.nombre,
          capacidad: form.capacidad,
          tipoSala: form.tipoSala || undefined,
          idCine: form.idCine,
        })
        setSalas(salas.map(s => s.id === updated.id ? updated : s))
      } else {
        const nueva = await localidadesService.createSala({
          nombre: form.nombre,
          capacidad: form.capacidad,
          tipoSala: form.tipoSala || undefined,
          idCine: form.idCine,
        })
        setSalas([...salas, nueva])
      }
      cerrarModal()
    } catch {
      setError('Error al guardar la sala.')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta sala?')) return
    try {
      await localidadesService.deleteSala(id)
      setSalas(salas.filter(s => s.id !== id))
    } catch {
      setError('Error al eliminar la sala.')
    }
  }

  const abrirEditar = (sala: Sala) => {
    setEditingSala(sala)
    setForm({
      nombre: sala.nombre,
      capacidad: sala.capacidad,
      tipoSala: sala.tipoSala || '',
      idCine: sala.cine.id,
    })
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEditingSala(null)
    setForm({ nombre: '', capacidad: 100, tipoSala: '', idCine: '' })
  }

  const getTipoColor = (tipo: string | null) => {
    switch (tipo) {
      case 'PREMIUM': return 'bg-cinema-gold-500/20 text-cinema-gold-500'
      case 'VIP': return 'bg-purple-500/20 text-purple-500'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const salasFiltradas = salas.filter(s =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cine.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="cinema-card p-6 text-gray-400 text-center">Cargando...</div>

  return (
    <div className="cinema-card p-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline text-sm">Cerrar</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gestión de Salas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm"
        >
          <FaPlus /> Nueva Sala
        </button>
      </div>

      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por sala o cine..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salasFiltradas.length === 0 && <p className="text-gray-500 text-sm col-span-3">No hay salas registradas.</p>}
        {salasFiltradas.map(sala => (
          <div key={sala.id} className="bg-cinema-dark-900/50 rounded-lg p-4 border border-cinema-gold-500/20 hover:border-cinema-gold-500/50 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <FaTheaterMasks className="text-cinema-gold-500" />
                <h3 className="font-bold text-white text-sm">{sala.nombre}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => abrirEditar(sala)} className="text-cinema-gold-500 hover:text-cinema-gold-400"><FaEdit size={13} /></button>
                <button onClick={() => handleEliminar(sala.id)} className="text-cinema-red-500 hover:text-cinema-red-400"><FaTrash size={13} /></button>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-3">{sala.cine.nombre} — {sala.cine.ciudad.nombre}</p>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <div className="flex items-center gap-1 text-cinema-gold-500 text-sm">
                <FaCouch size={12} />
                <span className="font-bold">{sala.capacidad}</span>
                <span className="text-gray-400 text-xs">asientos</span>
              </div>
              {sala.tipoSala && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${getTipoColor(sala.tipoSala)}`}>
                  {sala.tipoSala}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
            <div className="flex justify-between items-center p-5 border-b border-cinema-gold-500/20">
              <h2 className="text-lg font-bold text-white">{editingSala ? 'Editar Sala' : 'Nueva Sala'}</h2>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Cine</label>
                <select
                  required
                  value={form.idCine}
                  onChange={e => setForm(prev => ({ ...prev, idCine: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value="">Seleccionar cine</option>
                  {cines.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.ciudad.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nombre de la Sala</label>
                <input
                  type="text" required
                  placeholder="Ej: Sala 1, Sala IMAX..."
                  value={form.nombre}
                  onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Tipo de Sala (opcional)</label>
                <select
                  value={form.tipoSala}
                  onChange={e => setForm(prev => ({ ...prev, tipoSala: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value="">Normal</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="VIP">VIP</option>
                  <option value="IMAX">IMAX</option>
                  <option value="4DX">4DX</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Capacidad (asientos)</label>
                <input
                  type="number" required min={1} max={1000}
                  value={form.capacidad}
                  onChange={e => setForm(prev => ({ ...prev, capacidad: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarModal} className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50">
                  {saving ? 'Guardando...' : editingSala ? 'Actualizar' : 'Crear'}
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
