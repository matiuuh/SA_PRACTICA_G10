interface Compra {
  id: number
  movie: string
  date: string
  seats: string
  amount: string
}

interface MisComprasProps {
  compras: Compra[]
}

const MisCompras: React.FC<MisComprasProps> = ({ compras }) => {
  return (
    <div className="cinema-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Mis Compras Recientes</h2>
      {compras.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-semibold">Película</th>
                <th className="pb-3 text-gray-400 font-semibold">Fecha</th>
                <th className="pb-3 text-gray-400 font-semibold">Asientos</th>
                <th className="pb-3 text-gray-400 font-semibold">Total</th>
                <th className="pb-3 text-gray-400 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.id} className="border-b border-gray-800">
                  <td className="py-3 text-white">{compra.movie}</td>
                  <td className="py-3 text-gray-400">{compra.date}</td>
                  <td className="py-3 text-gray-400">{compra.seats}</td>
                  <td className="py-3 text-gray-400">{compra.amount}</td>
                  <td className="py-3">
                    <button className="text-cinema-gold-500 hover:text-cinema-gold-400 text-sm">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No tienes compras realizadas aún</p>
      )}
    </div>
  )
}

export default MisCompras
