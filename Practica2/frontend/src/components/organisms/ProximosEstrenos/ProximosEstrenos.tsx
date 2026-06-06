import { FaCalendarAlt } from 'react-icons/fa'

interface Estreno {
  titulo: string
  fecha: string
  genero: string
}

interface ProximosEstrenosProps {
  estrenos: Estreno[]
}

const ProximosEstrenos: React.FC<ProximosEstrenosProps> = ({ estrenos }) => {
  return (
    <div className="cinema-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Próximos Estrenos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {estrenos.map((estreno, idx) => (
          <div key={idx} className="bg-cinema-dark-900/50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">{estreno.titulo}</h3>
              <p className="text-gray-400 text-sm">{estreno.genero}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-cinema-gold-500">
                <FaCalendarAlt />
                <span className="text-sm">{estreno.fecha}</span>
              </div>
              <button className="text-cinema-red-500 text-sm hover:underline mt-1">
                Recordarme
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProximosEstrenos
