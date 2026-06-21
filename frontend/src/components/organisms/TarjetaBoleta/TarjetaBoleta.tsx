// src/components/organisms/TarjetaBoleta/TarjetaBoleta.tsx

import type { TicketHistoryItem } from '../../../types/boletos.types';

interface TarjetaBoletaProps {
  boleta: TicketHistoryItem;
  onDescargar: (id: string) => void;
}

const TarjetaBoleta = ({ boleta, onDescargar }: TarjetaBoletaProps) => {
  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatHora = (hora: string | null) => {
    if (!hora) return 'No disponible';
    return hora.slice(0, 5);
  };

  const asientosTexto = boleta.asientos.length > 0
    ? boleta.asientos.map((a) => `${a.fila}${a.numero}`).join(', ')
    : 'No disponibles';

  const estaActivo = boleta.estado === 'VALIDO';

  return (
    <div className="relative group">
      {/* Efecto de sombra/elevación en hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cinema-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
      
      {/* Contenedor principal del boleto con forma de ticket */}
      <div className="relative w-full max-w-sm mx-auto transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
        
        {/* Cuerpo del boleto con efecto ticket (semicírculos laterales) */}
        <div className="relative bg-gradient-to-br from-[#8B0000] via-[#4A0000] to-black rounded-2xl overflow-hidden shadow-xl">
          
          {/* Semicírculos laterales recortados (efecto ticket) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-gray-900 rounded-r-full shadow-inner" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-gray-900 rounded-l-full shadow-inner" />

          {/* Contenido interno */}
          <div className="relative px-8 py-6">
            
            {/* Línea divisoria superior decorativa */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cinema-gold-500/40 to-transparent" />
            
            {/* Encabezado del boleto */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">FilmStars</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                estaActivo 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {estaActivo ? '● ACTIVO' : '● USADO'}
              </span>
            </div>

            {/* Título de la película */}
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
              {boleta.pelicula.titulo || 'Película no disponible'}
            </h3>

            {/* Detalles del evento */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Fecha</p>
                <p className="text-white font-medium">{formatFecha(boleta.funcion.fecha)}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Hora</p>
                <p className="text-white font-medium">{formatHora(boleta.funcion.hora)}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Sala</p>
                <p className="text-white font-medium">{boleta.funcion.sala || 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Asientos</p>
                <p className="text-cinema-gold-400 font-bold">{asientosTexto}</p>
              </div>
            </div>

            {/* Total y código resumido */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Total</p>
                <p className="text-cinema-gold-400 font-bold text-lg">Q{boleta.reserva.total.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Código</p>
                <p className="text-white/60 font-mono text-xs truncate max-w-[120px]">
                  {boleta.codigoQr}
                </p>
              </div>
            </div>

            {/* Línea punteada divisoria */}
            <div className="relative my-4">
              <div className="border-t-2 border-dashed border-white/20" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#4A0000] px-3 py-0.5 rounded-full">
                <span className="text-[10px] text-white/40 font-mono">✦</span>
              </div>
            </div>

            {/* Sección QR */}
            <div className="flex items-center gap-4">
              {/* Código QR */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-gray-400 text-[8px] text-center font-mono leading-tight">
                    QR
                    <br />
                    {boleta.codigoQr.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* Información del QR */}
              <div className="flex-1 min-w-0">
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Código de acceso</p>
                <p className="text-white/70 font-mono text-xs truncate">{boleta.codigoQr}</p>
                <p className="text-white/20 text-[9px] mt-0.5">
                  {new Date(boleta.fechaEmision).toLocaleString('es-GT')}
                </p>
              </div>

              {/* Botón descarga (solo si está activo) */}
              {estaActivo && (
                <button
                  onClick={() => onDescargar(boleta.id)}
                  className="flex-shrink-0 bg-cinema-gold-500 hover:bg-cinema-gold-400 text-black font-bold px-3 py-2 rounded-lg text-xs transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Descargar
                </button>
              )}
            </div>

            {/* Línea divisoria inferior decorativa */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cinema-gold-500/40 to-transparent" />
          </div>
        </div>

        {/* Borde exterior decorativo (glow) */}
        <div className="absolute inset-0 rounded-2xl border border-cinema-gold-500/10 pointer-events-none" />
        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
      </div>
    </div>
  );
};

export default TarjetaBoleta;