import { useState, useEffect } from 'react'
import { FaChair, FaFilm, FaCalendarAlt, FaClock, FaTicketAlt, FaTrash, FaCouch } from 'react-icons/fa'

interface Asiento {
  id: string
  numero: number
  fila: string
  estado: 'disponible' | 'seleccionado' | 'ocupado'
}

interface SeleccionAsientosProps {
  pelicula?: {
    titulo: string
    horario: string
    fecha: string
  }
  onConfirmarSeleccion: (asientosSeleccionados: Asiento[], total: number) => void
}

const SeleccionAsientos: React.FC<SeleccionAsientosProps> = ({ 
  pelicula = { 
    titulo: 'Dune: Parte 2', 
    horario: '20:30', 
    fecha: '2026-06-10' 
  }, 
  onConfirmarSeleccion 
}) => {
  const [asientos, setAsientos] = useState<Asiento[]>([])
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<Asiento[]>([])
  const [loading, setLoading] = useState(true)

  const precioPorAsiento = 45

  useEffect(() => {
    generarAsientos()
  }, [])

  const generarAsientos = () => {
    const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const asientosGenerados: Asiento[] = []
    
    for (const fila of filas) {
      for (let numero = 1; numero <= 12; numero++) {
        const isOcupado = Math.random() < 0.15
        asientosGenerados.push({
          id: `${fila}${numero}`,
          numero,
          fila,
          estado: isOcupado ? 'ocupado' : 'disponible'
        })
      }
    }
    
    setAsientos(asientosGenerados)
    setLoading(false)
  }

  const handleAsientoClick = (asiento: Asiento) => {
    if (asiento.estado === 'ocupado') return
    
    const esSeleccionado = asientosSeleccionados.some(a => a.id === asiento.id)
    
    if (esSeleccionado) {
      setAsientosSeleccionados(asientosSeleccionados.filter(a => a.id !== asiento.id))
      setAsientos(asientos.map(a => 
        a.id === asiento.id ? { ...a, estado: 'disponible' } : a
      ))
    } else {
      if (asientosSeleccionados.length >= 10) {
        alert('Máximo 10 asientos por transacción')
        return
      }
      setAsientosSeleccionados([...asientosSeleccionados, { ...asiento, estado: 'seleccionado' }])
      setAsientos(asientos.map(a => 
        a.id === asiento.id ? { ...a, estado: 'seleccionado' } : a
      ))
    }
  }

  const handleEliminarSeleccion = (asientoId: string) => {
    setAsientosSeleccionados(asientosSeleccionados.filter(a => a.id !== asientoId))
    setAsientos(asientos.map(a => 
      a.id === asientoId ? { ...a, estado: 'disponible' } : a
    ))
  }

  const handleConfirmar = () => {
    if (asientosSeleccionados.length === 0) {
      alert('Selecciona al menos un asiento')
      return
    }
    const total = asientosSeleccionados.length * precioPorAsiento
    onConfirmarSeleccion(asientosSeleccionados, total)
  }

  const getColorAsiento = (estado: string) => {
    switch(estado) {
      case 'disponible': return 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-cinema-gold-500 hover:to-cinema-gold-600 hover:text-black hover:shadow-lg hover:scale-110'
      case 'seleccionado': return 'bg-gradient-to-br from-cinema-gold-500 to-cinema-gold-600 text-black shadow-lg scale-105 ring-2 ring-white/50'
      case 'ocupado': return 'bg-gradient-to-br from-green-700 to-green-800 cursor-not-allowed opacity-60'
      default: return 'bg-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="cinema-card p-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-cinema-gold-500 mx-auto"></div>
          <p className="text-gray-400 mt-6 text-lg">Cargando mapa de asientos...</p>
        </div>
      </div>
    )
  }

  const asientosPorFila = asientos.reduce((acc, asiento) => {
    if (!acc[asiento.fila]) {
      acc[asiento.fila] = []
    }
    acc[asiento.fila].push(asiento)
    return acc
  }, {} as Record<string, Asiento[]>)

  const total = asientosSeleccionados.length * precioPorAsiento

  return (
    <div className="cinema-card p-8">
      {/* Información de la función */}
      <div className="bg-gradient-to-r from-cinema-dark-900 to-cinema-dark-800 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-cinema-red-500/20 rounded-full flex items-center justify-center">
              <FaFilm className="text-cinema-red-500 text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{pelicula.titulo}</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <FaCalendarAlt className="text-cinema-gold-500" />
                  <span>{pelicula.fecha}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaClock className="text-cinema-gold-500" />
                  <span>{pelicula.horario}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaTicketAlt className="text-cinema-gold-500" />
                  <span>Q{precioPorAsiento} por asiento</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Sala Premium</div>
            <div className="text-xs text-gray-500">Butacas reclinables</div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-8 mb-8 pb-6 border-b border-cinema-gold-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg shadow-md"></div>
          <span className="text-sm text-gray-300">Disponible</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cinema-gold-500 to-cinema-gold-600 rounded-lg shadow-md ring-1 ring-white/50"></div>
          <span className="text-sm text-gray-300">Seleccionado</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-700 to-green-800 rounded-lg opacity-60"></div>
          <span className="text-sm text-gray-300">Ocupado</span>
        </div>
        <div className="flex items-center gap-3">
          <FaCouch className="text-cinema-gold-500 text-xl" />
          <span className="text-sm text-gray-300">Butaca Premium</span>
        </div>
      </div>

      {/* Pantalla */}
      <div className="text-center mb-10">
        <div className="bg-gradient-to-r from-cinema-dark-900 via-cinema-dark-800 to-cinema-dark-900 py-4 rounded-xl mb-3 max-w-2xl mx-auto">
          <FaChair className="text-gray-500 text-2xl mx-auto mb-2" />
          <p className="text-gray-400 text-sm uppercase tracking-wider">Pantalla IMAX</p>
        </div>
        <div className="w-full max-w-4xl mx-auto h-1 bg-gradient-to-r from-transparent via-cinema-gold-500 to-transparent"></div>
      </div>

      {/* Mapa de asientos - CENTRADO */}
      <div className="overflow-x-auto mb-8">
        <div className="flex justify-center">
          <div className="min-w-max">
            {Object.entries(asientosPorFila).map(([fila, asientosFila]) => (
              <div key={fila} className="flex items-center gap-4 mb-3 justify-center">
                <div className="w-10 text-center font-bold text-cinema-gold-500 text-lg">{fila}</div>
                <div className="flex gap-2">
                  {asientosFila.map((asiento) => (
                    <button
                      key={asiento.id}
                      onClick={() => handleAsientoClick(asiento)}
                      disabled={asiento.estado === 'ocupado'}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-200 ${getColorAsiento(asiento.estado)}`}
                    >
                      {asiento.numero}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de selección */}
      {asientosSeleccionados.length > 0 && (
        <div className="bg-gradient-to-r from-cinema-dark-900 to-cinema-dark-800 rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <FaTicketAlt className="text-cinema-gold-500" />
            Asientos seleccionados:
          </h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {asientosSeleccionados.map((asiento) => (
              <div
                key={asiento.id}
                className="flex items-center gap-2 bg-cinema-gold-500/20 px-4 py-2 rounded-full"
              >
                <span className="text-cinema-gold-500 font-bold text-lg">{asiento.id}</span>
                <button
                  onClick={() => handleEliminarSeleccion(asiento.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between items-center pt-4 border-t border-cinema-gold-500/20">
            <div>
              <span className="text-gray-400 text-lg">Total a pagar:</span>
              <span className="text-cinema-gold-500 text-3xl font-bold ml-3">Q{total}</span>
            </div>
            <button
              onClick={handleConfirmar}
              className="bg-gradient-to-r from-cinema-red-500 to-cinema-red-600 hover:from-cinema-red-600 hover:to-cinema-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Continuar al Pago
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeleccionAsientos
