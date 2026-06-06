import { FaUserCircle } from 'react-icons/fa'
import { authService } from '../../../services/auth.service'

const UserProfileHeader = () => {
  const user = authService.getUser()

  return (
    <div className="cinema-card p-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-cinema-red-500 to-cinema-gold-500 rounded-full flex items-center justify-center">
          <FaUserCircle className="text-white text-2xl" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">
            Bienvenido, {user?.nombre?.split(' ')[0] || 'Usuario'}
          </h3>
          <p className="text-gray-400 text-sm">{user?.correo || 'usuario@email.com'}</p>
        </div>
      </div>
    </div>
  )
}

export default UserProfileHeader
