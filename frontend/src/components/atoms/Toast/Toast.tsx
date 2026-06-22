import { useEffect, useRef } from 'react'
import { FaCheckCircle, FaTimes, FaStar } from 'react-icons/fa'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const getStyles = () => {
    switch(type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-cinema-red-600 border-red-400'
      default:
        return 'bg-gradient-to-r from-cinema-red-500 to-cinema-gold-500 border-cinema-gold-400'
    }
  }

  const getIcon = () => {
    switch(type) {
      case 'success':
        return <FaCheckCircle className="text-white text-xl" />
      case 'error':
        return <FaTimes className="text-white text-xl" />
      default:
        return <FaStar className="text-white text-xl" />
    }
  }

  return (
    <div className="fixed top-20 right-4 z-[100] animate-slide-in-right">
      <div className={`${getStyles()} rounded-lg shadow-2xl border p-4 min-w-[300px] max-w-md`}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-white rounded-b-lg animate-shrink"
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default Toast
