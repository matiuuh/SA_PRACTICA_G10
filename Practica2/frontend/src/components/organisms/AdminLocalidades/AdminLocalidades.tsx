import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCity, FaMapMarkerAlt, FaTheaterMasks } from 'react-icons/fa'
import { localidadesService } from '../../../services/localidades.service'
import type { Ciudad, Cine } from '../../../types/localidades.types'

interface Props {
  triggerCreateCiudad?: number
  triggerCreateCine?: number
}

const AdminLocalidades = ({ triggerCreateCiudad = 0, triggerCreateCine = 0 }: Props) => {
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [cines, setCines] = useState<Cine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal ciudad
  const [showCiudadModal, setShowCiudadModal] = useState(false)
  const [editingCiudad, setEditingCiudad] = useState<Ciudad | null>(null)
  const [ciudadForm, setCiudadForm] = useState({ nombre: '' })

  // Modal cine
  const [showCineModal, setShowCineModal] = useState(false)
  const [editingCine, setEditingCine] = useState<Cine | null>(null)
  const [cineForm, setCineForm] = useState({ nombre: '', direccion: '', idCiudad: '' })

  const [saving, setSaving] = useState(false)

  useEffect(() => { cargarDatos() }, [])

  useEffect(() => {
    if (triggerCreateCiudad > 0) setShowCiudadModal(true)
  }, [triggerCreateCiudad])

  useEffect(() => {
    if (triggerCreateCine > 0) setShowCineModal(true)
  }, [triggerCreateCine])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      const [c, ci] = await Promise.all([
        localidadesService.getCiudades(),
        localidadesService.getCines(),
      ])
      setCiudades(c)
      setCines(ci)
    } catch {
      setError('Error al cargar los datos. Verifica que el servicio esté activo.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Ciudades ───────────────────────────────────────────────────

  const handleSubmitCiudad = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingCiudad) {
        const updated = await localidadesService.updateCiudad(editingCiudad.id, ciudadForm)
        setCiudades(ciudades.map(c => c.id === updated.id ? updated : c))
      } else {
        const nueva = await localidadesService.createCiudad(ciudadForm)
        setCiudades([...ciudades, nueva])
      }
      cerrarCiudadModal()
    } catch {
      setError('Error al guardar la ciudad.')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminarCiudad = async (id: string) => {
    if (!confirm('¿Eliminar esta ciudad? Se eliminarán sus cines asociados.')) return
    try {
      await localidadesService.deleteCiudad(id)
      setCiudades(ciudades.filter(c => c.id !== id))
      setCines(cines.filter(ci => ci.ciudad.id !== id))
    } catch {
      setError('Error al eliminar la ciudad.')
    }
  }

  const abrirEditarCiudad = (ciudad: Ciudad) => {
    setEditingCiudad(ciudad)
    setCiudadForm({ nombre: ciudad.nombre })
    setShowCiudadModal(true)
  }

  const cerrarCiudadModal = () => {
    setShowCiudadModal(false)
    setEditingCiudad(null)
    setCiudadForm({ nombre: '' })
  }

  // ─── Cines ──────────────────────────────────────────────────────

  const handleSubmitCine = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingCine) {
        const updated = await localidadesService.updateCine(editingCine.id, cineForm)
        setCines(cines.map(c => c.id === updated.id ? updated : c))
      } else {
        const nuevo = await localidadesService.createCine(cineForm)
        setCines([...cines, nuevo])
      }
      cerrarCineModal()
    } catch {
      setError('Error al guardar el cine.')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminarCine = async (id: string) => {
    if (!confirm('¿Eliminar este cine?')) return
    try {
      await localidadesService.deleteCine(id)
      setCines(cines.filter(c => c.id !== id))
    } catch {
      setError('Error al eliminar el cine.')
    }
  }

  const abrirEditarCine = (cine: Cine) => {
    setEditingCine(cine)
    setCineForm({ nombre: cine.nombre, direccion: cine.direccion, idCiudad: cine.ciudad.id })
    setShowCineModal(true)
  }

  const cerrarCineModal = () => {
    setShowCineModal(false)
    setEditingCine(null)
    setCineForm({ nombre: '', direccion: '', idCiudad: '' })
  }

  const cinesFiltrados = cines.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ciudad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="cinema-card p-6 text-gray-400 text-center">Cargando...</div>

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline text-sm">Cerrar</button>
        </div>
      )}

      {/* ─── Ciudades ─── */}
      <div className="cinema-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Ciudades</h2>
          <button
            onClick={() => setShowCiudadModal(true)}
            className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm"
          >
            <FaPlus /> Nueva Ciudad
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ciudades.length === 0 && <p className="text-gray-500 text-sm">No hay ciudades registradas.</p>}
          {ciudades.map(ciudad => (
            <div key={ciudad.id} className="flex items-center gap-2 bg-cinema-dark-900/50 border border-cinema-gold-500/20 rounded-lg px-3 py-2">
              <FaCity className="text-cinema-gold-500 text-sm" />
              <span className="text-white text-sm">{ciudad.nombre}</span>
              <button onClick={() => abrirEditarCiudad(ciudad)} className="text-cinema-gold-500 hover:text-cinema-gold-400 ml-1">
                <FaEdit size={12} />
              </button>
              <button onClick={() => handleEliminarCiudad(ciudad.id)} className="text-cinema-red-500 hover:text-cinema-red-400">
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Cines ─── */}
      <div className="cinema-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Cines</h2>
          <button
            onClick={() => setShowCineModal(true)}
            className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm"
          >
            <FaPlus /> Nuevo Cine
          </button>
        </div>

        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por ciudad o cine..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cinesFiltrados.length === 0 && <p className="text-gray-500 text-sm col-span-3">No hay cines registrados.</p>}
          {cinesFiltrados.map(cine => (
            <div key={cine.id} className="bg-cinema-dark-900/50 rounded-lg p-4 border border-cinema-gold-500/20 hover:border-cinema-gold-500/50 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <FaTheaterMasks className="text-cinema-gold-500" />
                  <h3 className="font-bold text-white text-sm">{cine.nombre}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => abrirEditarCine(cine)} className="text-cinema-gold-500 hover:text-cinema-gold-400"><FaEdit size={13} /></button>
                  <button onClick={() => handleEliminarCine(cine.id)} className="text-cinema-red-500 hover:text-cinema-red-400"><FaTrash size={13} /></button>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                <FaCity size={10} /> <span>{cine.ciudad.nombre}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <FaMapMarkerAlt size={10} /> <span>{cine.direccion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Modal Ciudad ─── */}
      {showCiudadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cinema-dark-800 rounded-2xl max-w-sm w-full border border-cinema-gold-500/30">
            <div className="flex justify-between items-center p-5 border-b border-cinema-gold-500/20">
              <h2 className="text-lg font-bold text-white">{editingCiudad ? 'Editar Ciudad' : 'Nueva Ciudad'}</h2>
              <button onClick={cerrarCiudadModal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmitCiudad} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nombre</label>
                <input
                  type="text" required
                  value={ciudadForm.nombre}
                  onChange={e => setCiudadForm({ nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarCiudadModal} className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50">
                  {saving ? 'Guardando...' : editingCiudad ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal Cine ─── */}
      {showCineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
            <div className="flex justify-between items-center p-5 border-b border-cinema-gold-500/20">
              <h2 className="text-lg font-bold text-white">{editingCine ? 'Editar Cine' : 'Nuevo Cine'}</h2>
              <button onClick={cerrarCineModal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmitCine} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Ciudad</label>
                <select
                  required
                  value={cineForm.idCiudad}
                  onChange={e => setCineForm(prev => ({ ...prev, idCiudad: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value="">Seleccionar ciudad</option>
                  {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nombre del Cine</label>
                <input
                  type="text" required
                  value={cineForm.nombre}
                  onChange={e => setCineForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Dirección</label>
                <input
                  type="text" required
                  value={cineForm.direccion}
                  onChange={e => setCineForm(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarCineModal} className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50">
                  {saving ? 'Guardando...' : editingCine ? 'Actualizar' : 'Crear'}
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
