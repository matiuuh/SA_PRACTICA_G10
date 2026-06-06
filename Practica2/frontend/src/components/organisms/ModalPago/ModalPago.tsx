import { useState } from 'react'
import { FaTimes, FaCreditCard, FaCalendarAlt, FaLock, FaTicketAlt, FaMoneyBillWave, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa'

interface ModalPagoProps {
  isOpen: boolean
  onClose: () => void
  onPagar: (datosPago: DatosPago) => void
  total: number
  asientos: string[]
  pelicula: string
  horario: string
  fecha: string
}

interface DatosPago {
  numeroTarjeta: string
  nombreTitular: string
  fechaExpiracion: string
  cvv: string
}

const ModalPago: React.FC<ModalPagoProps> = ({
  isOpen,
  onClose,
  onPagar,
  total,
  asientos,
  pelicula,
  horario,
  fecha
}) => {
  const [datosPago, setDatosPago] = useState<DatosPago>({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    // Formatear número de tarjeta
    if (name === 'numeroTarjeta') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19)
    }
    
    // Formatear fecha de expiración
    if (name === 'fechaExpiracion') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .slice(0, 5)
    }

    setDatosPago(prev => ({ ...prev, [name]: formattedValue }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (datosPago.numeroTarjeta.replace(/\s/g, '').length < 16) {
      setError('Número de tarjeta inválido')
      return
    }
    if (datosPago.nombreTitular.length < 3) {
      setError('Nombre del titular inválido')
      return
    }
    if (datosPago.fechaExpiracion.length < 5) {
      setError('Fecha de expiración inválida')
      return
    }
    if (datosPago.cvv.length < 3) {
      setError('CVV inválido')
      return
    }

    setIsLoading(true)
    
    // Simular procesamiento de pago
    setTimeout(() => {
      onPagar(datosPago)
      setIsLoading(false)
    }, 2000)
  }

  // Detectar tipo de tarjeta por el primer dígito
  const getCardIcon = () => {
    const firstDigit = datosPago.numeroTarjeta.replace(/\s/g, '').charAt(0)
    if (firstDigit === '4') return <FaCcVisa className="text-2xl text-blue-500" />
    if (firstDigit === '5') return <FaCcMastercard className="text-2xl text-orange-500" />
    if (firstDigit === '3') return <FaCcAmex className="text-2xl text-green-500" />
    return <FaCreditCard className="text-2xl text-gray-400" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-cinema-dark-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-cinema-gold-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-cinema-gold-500 text-2xl" />
            <h2 className="text-xl font-bold text-white">Pago de Boletos</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Resumen de compra */}
        <div className="p-6 border-b border-cinema-gold-500/20">
          <h3 className="text-white font-semibold mb-3">Resumen de compra</h3>
          <div className="bg-cinema-dark-900/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Película:</span>
              <span className="text-white font-medium">{pelicula}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Fecha:</span>
              <span className="text-white font-medium">{fecha}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Horario:</span>
              <span className="text-white font-medium">{horario}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Asientos:</span>
              <span className="text-white font-medium">{asientos.join(', ')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-cinema-gold-500/20">
              <span className="text-gray-300 font-semibold">Total:</span>
              <span className="text-cinema-gold-500 font-bold text-xl">Q{total}</span>
            </div>
          </div>
        </div>

        {/* Formulario de pago */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Número de tarjeta
            </label>
            <div className="relative">
              <input
                type="text"
                name="numeroTarjeta"
                placeholder="1234 5678 9012 3456"
                value={datosPago.numeroTarjeta}
                onChange={handleChange}
                maxLength={19}
                className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cinema-gold-500 focus:outline-none"
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {getCardIcon()}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Nombre del titular
            </label>
            <input
              type="text"
              name="nombreTitular"
              placeholder="Como aparece en la tarjeta"
              value={datosPago.nombreTitular}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cinema-gold-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Fecha expiración
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fechaExpiracion"
                  placeholder="MM/AA"
                  value={datosPago.fechaExpiracion}
                  onChange={handleChange}
                  maxLength={5}
                  className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cinema-gold-500 focus:outline-none"
                  required
                />
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                CVV
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="cvv"
                  placeholder="123"
                  value={datosPago.cvv}
                  onChange={handleChange}
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cinema-gold-500 focus:outline-none"
                  required
                />
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 rounded-lg font-semibold transition-all bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </div>
              ) : (
                `Pagar Q${total}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalPago
