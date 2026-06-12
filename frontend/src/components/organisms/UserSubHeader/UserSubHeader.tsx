import { FaFilm, FaChair } from 'react-icons/fa'
import { type TabType } from '../../../types/panel.types'

interface UserSubHeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const UserSubHeader: React.FC<UserSubHeaderProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'cartelera' as TabType, label: 'Cartelera', icon: FaFilm },
    { id: 'seleccion-asientos' as TabType, label: 'Selección de Asientos', icon: FaChair },
  ]

  return (
    <div className="cinema-card p-1 mb-8">
      <div className="flex flex-wrap gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-cinema-red-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-cinema-dark-800'
              }`}
            >
              <Icon className={`text-lg ${isActive ? 'text-white' : 'text-cinema-gold-500'}`} />
              <span className="font-medium hidden sm:inline">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default UserSubHeader
