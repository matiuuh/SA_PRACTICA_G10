import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaArrowLeft, FaTicketAlt, FaExclamationCircle } from 'react-icons/fa'
import Button from '../components/atoms/Button/Button'
import MainLayout from '../components/templates/MainLayout/MainLayout'
import Toast from '../components/atoms/Toast/Toast'
import { authService } from '../services/auth.service'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [emailError, setEmailError] = useState('')

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrorMessage('')
    setShowErrorToast(false)

    if (name === 'correo') {
      if (value && !validateEmail(value)) {
        setEmailError('Por favor, ingresa un correo electrónico válido')
      } else {
        setEmailError('')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(formData.correo)) {
      setEmailError('Por favor, ingresa un correo electrónico válido')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setShowErrorToast(false)

    try {
      const response = await authService.login({
        correo: formData.correo,
        password: formData.password
      })
      
      // Mostrar notificación de éxito
      setSuccessMessage(`¡Bienvenido, ${response.user.nombre}!`)
      setShowSuccessToast(true)
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        if (response.user.rol === 'ADMINISTRADOR') {
          navigate('/panel/admin')
        } else if (response.user.rol === 'CLIENTE') {
          navigate('/panel/usuario')
        } else {
          navigate('/home')
        }
      }, 1500)
      
    } catch (err: any) {
      console.error('Error en login:', err)
      
      // Manejar diferentes tipos de errores
      let mensajeError = 'Error al iniciar sesión. Por favor, intenta de nuevo.'
      
      if (err.response?.status === 400 || err.response?.status === 401) {
        mensajeError = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.'
      } else if (err.message?.includes('Network Error')) {
        mensajeError = 'Error de conexión. Verifica que el servidor esté funcionando.'
      } else if (err.response?.data?.message) {
        mensajeError = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(' ')
          : err.response.data.message
      }
      
      setErrorMessage(mensajeError)
      setShowErrorToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <MainLayout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-white text-3xl font-bold">Iniciar Sesión</h2>
              <p className="text-gray-400 mt-2">
                Bienvenido de vuelta a FilmStars
              </p>
              <Link to="/register" className="inline-flex items-center text-cinema-gold-500 hover:text-cinema-gold-400 text-sm mt-4">
                <FaArrowLeft className="mr-1" />
                Crear una cuenta nueva
              </Link>
            </div>

            <div className="grid lg:grid-cols-5 items-center bg-cinema-dark-800/50 backdrop-blur-sm rounded-2xl border border-cinema-gold-500/20 overflow-hidden">
              <div className="lg:col-span-2 bg-gradient-to-br from-cinema-red-600 to-cinema-dark-800 p-8 h-full">
                <div className="relative z-10">
                  <FaTicketAlt className="text-cinema-gold-500 text-4xl mb-4" />
                  <h3 className="text-2xl text-white font-bold mb-4">¡Bienvenido de Vuelta!</h3>
                  <p className="text-gray-300 text-sm mb-8">
                    Accede a tu cuenta y disfruta de la mejor experiencia cinematográfica
                  </p>
                  
                  <ul className="space-y-6">
                    <li className="flex items-start text-gray-300">
                      <FaTicketAlt className="w-5 h-5 mt-0.5 text-cinema-gold-500 shrink-0" />
                      <span className="text-sm ml-3">Compra tus boletos más rápido</span>
                    </li>
                    <li className="flex items-start text-gray-300">
                      <FaTicketAlt className="w-5 h-5 mt-0.5 text-cinema-gold-500 shrink-0" />
                      <span className="text-sm ml-3">Accede a tu historial de compras</span>
                    </li>
                    <li className="flex items-start text-gray-300">
                      <FaTicketAlt className="w-5 h-5 mt-0.5 text-cinema-gold-500 shrink-0" />
                      <span className="text-sm ml-3">Recibe notificaciones de estrenos</span>
                    </li>
                  </ul>

                  <div className="mt-12 pt-8 border-t border-cinema-gold-500/30">
                    <p className="text-gray-300 text-sm mb-3">¿Nuevo en FilmStars?</p>
                    <Link to="/register">
                      <Button variant="outline" size="sm" className="w-full">
                        Crear Cuenta
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="correo"
                      required
                      placeholder="Correo electrónico"
                      value={formData.correo}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full pl-10 pr-4 py-3 bg-cinema-dark-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition ${
                        emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-cinema-gold-500'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-2 text-sm text-red-400 mt-1">
                      <FaExclamationCircle className="shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  )}

                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Contraseña"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none transition"
                    />
                  </div>

                  {errorMessage && (
                    <div
                      role="alert"
                      className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                    >
                      <FaExclamationCircle className="shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>

      {/* Toast de éxito */}
      {showSuccessToast && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      {/* Toast de error */}
      {showErrorToast && (
        <Toast
          message={errorMessage}
          type="error"
          onClose={() => setShowErrorToast(false)}
        />
      )}
    </>
  )
}

export default Login
