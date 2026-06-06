import { useState } from 'react'
import { FaTimes, FaClock, FaCalendarAlt, FaFilm } from 'react-icons/fa'

interface Pelicula {
  id: number
  titulo: string
  genero: string
  duracion: string
  clasificacion: string
  horarios: string[]
}

interface ModalHorariosProps {
  pelicula: Pelicula | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (horario: string) => void
}

const ModalHorarios: React.FC<ModalHorariosProps> = ({ pelicula, isOpen, onClose, onConfirm }) => {
  const [selectedHorario, setSelectedHorario] = useState<string>('')

  if (!isOpen || !pelicula) return null

  const handleConfirm = () => {
    if (selectedHorario) {
      onConfirm(selectedHorario)
      setSelectedHorario('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
          <div className="flex items-center gap-3">
            <FaFilm className="text-cinema-red-500 text-2xl" />
            <h2 className="text-xl font-bold text-white">Seleccionar Horario</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información de la película */}
          <div className="bg-cinema-dark-900/50 rounded-lg p-4">
            <h3 className="font-bold text-white text-lg mb-2">{pelicula.titulo}</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-400">{pelicula.genero}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{pelicula.duracion}</span>
              <span className="text-gray-400">•</span>
              <span className="text-cinema-gold-500">{pelicula.clasificacion}</span>
            </div>
          </div>

          {/* Selección de horario */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-3">
              <FaClock className="inline mr-2 text-cinema-gold-500" />
              Selecciona un horario
            </label>
            <div className="grid grid-cols-3 gap-2">
              {pelicula.horarios.map((horario, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedHorario(horario)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedHorario === horario
                      ? 'bg-cinema-red-500 text-white'
                      : 'bg-cinema-dark-900 text-gray-300 hover:bg-cinema-red-500/50 hover:text-white'
                  }`}
                >
                  {horario}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-cinema-gold-500/20 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedHorario}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              selectedHorario
                ? 'bg-cinema-red-500 text-white hover:bg-cinema-red-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalHorarios
