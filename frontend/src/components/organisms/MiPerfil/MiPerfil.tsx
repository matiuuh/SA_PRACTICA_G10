import { useState } from 'react'
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import Button from '../../atoms/Button/Button'

interface MiPerfilProps {
  usuario: {
    nombre: string
    correo: string
  }
}

const MiPerfil: React.FC<MiPerfilProps> = ({ usuario }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    correo: usuario.correo
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    console.log('Guardar cambios:', formData)
    setIsEditing(false)
  }

  return (
    <div className="cinema-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Mi Perfil</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <FaEdit className="inline mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="primary" size="sm">
              <FaSave className="inline mr-2" />
              Guardar
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              <FaTimes className="inline mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Nombre Completo</label>
          {isEditing ? (
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
            />
          ) : (
            <p className="text-white flex items-center gap-2">
              <FaUser className="text-cinema-gold-500" />
              {formData.nombre}
            </p>
          )}
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Correo Electrónico</label>
          {isEditing ? (
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
            />
          ) : (
            <p className="text-white flex items-center gap-2">
              <FaEnvelope className="text-cinema-gold-500" />
              {formData.correo}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MiPerfil
