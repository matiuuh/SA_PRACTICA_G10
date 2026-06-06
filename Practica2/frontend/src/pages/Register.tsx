import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowLeft, FaTicketAlt } from 'react-icons/fa'
import Button from '../components/atoms/Button/Button'
import MainLayout from '../components/templates/MainLayout/MainLayout'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.telefono.length < 8) {
      setError('El número de teléfono debe tener al menos 8 dígitos')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Registro exitoso:', formData)
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Error al registrar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-white text-3xl font-bold">Crear Cuenta</h2>
            <p className="text-gray-400 mt-2">
              Únete a FilmStars y vive la mejor experiencia cinematográfica
            </p>
            <Link to="/login" className="inline-flex items-center text-cinema-gold-500 hover:text-cinema-gold-400 text-sm mt-4">
              <FaArrowLeft className="mr-1" />
              Volver a Iniciar Sesión
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-cinema-red-500/10 border border-cinema-red-500/30 rounded-lg">
              <p className="text-sm text-cinema-red-500">{error}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-5 items-center bg-cinema-dark-800/50 backdrop-blur-sm rounded-2xl border border-cinema-gold-500/20 overflow-hidden">
            <div className="lg:col-span-2 bg-gradient-to-br from-cinema-red-600 to-cinema-dark-800 p-8 h-full">
              <div className="relative z-10">
                <FaTicketAlt className="text-cinema-gold-500 text-4xl mb-4" />
                <h3 className="text-2xl text-white font-bold mb-4">Ventajas Exclusivas</h3>
                <p className="text-gray-300 text-sm mb-8">
                  Como miembro de FilmStars, tendrás acceso a beneficios exclusivos
                </p>
                
                <ul className="space-y-6">
                  <li className="flex items-start text-gray-300">
                    <FaTicketAlt className="w-5 h-5 mt-0.5 text-cinema-gold-500 shrink-0" />
                    <span className="text-sm ml-3">Acceso a preventas exclusivas</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <FaTicketAlt className="w-5 h-5 mt-0.5 text-cinema-gold-500 shrink-0" />
                    <span className="text-sm ml-3">Descuentos en combos de dulcería</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <FaTicketAlt className="w-5 h-5 mt-0.5 text-cinema-gold-500 shrink-0" />
                    <span className="text-sm ml-3">Puntos por cada compra</span>
                  </li>
                </ul>

                <div className="mt-12 pt-8 border-t border-cinema-gold-500/30">
                  <p className="text-gray-300 text-sm mb-3">¿Ya tienes cuenta?</p>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="nombreCompleto"
                    required
                    placeholder="Nombre completo"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none transition"
                  />
                </div>

                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none transition"
                  />
                </div>

                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    name="telefono"
                    required
                    placeholder="Número de teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none transition"
                  />
                </div>

                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Contraseña "
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none transition"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Register
