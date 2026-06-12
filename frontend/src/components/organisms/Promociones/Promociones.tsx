import { FaTicketAlt, FaGift, FaPercent } from 'react-icons/fa'

const Promociones = () => {
  const promociones = [
    { titulo: '2x1 en Martes', descripcion: 'Todos los martes 2x1 en todas las funciones', icon: FaTicketAlt },
    { titulo: 'Descuento Estudiante', descripcion: '20% de descuento presentando carnet', icon: FaPercent },
    { titulo: 'Combo Familiar', descripcion: '4 boletos + 2 combos grandes a Q199', icon: FaGift },
    { titulo: 'Preventa Exclusiva', descripcion: '20% de descuento en preventa de estrenos', icon: FaTicketAlt },
  ]

  return (
    <div className="cinema-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Promociones Especiales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promociones.map((promo, idx) => {
          const Icon = promo.icon
          return (
            <div key={idx} className="bg-gradient-to-r from-cinema-red-500/20 to-cinema-gold-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="text-cinema-gold-500 text-xl" />
                <h3 className="font-bold text-white">{promo.titulo}</h3>
              </div>
              <p className="text-gray-400 text-sm">{promo.descripcion}</p>
              <button className="mt-3 text-cinema-gold-500 text-sm hover:underline">
                Ver más detalles →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Promociones
