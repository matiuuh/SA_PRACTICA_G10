import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaChair,
  FaClock,
  FaFilm,
  FaTicketAlt,
  FaTrash,
} from 'react-icons/fa';
import { io, type Socket } from 'socket.io-client';
import { reservasService } from '../../../services/reservas.service';
import type { UserAsiento } from '../../../types/user-panel.types';

interface SeleccionAsientosProps {
  pelicula: {
    titulo: string;
    horario: string;
    fecha: string;
    funcionId: string;
    capacidadSala: number;
    precio: number;
  };
  onConfirmarSeleccion: (asientosSeleccionados: UserAsiento[], total: number) => void;
}

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const RESERVAS_WS_URL = import.meta.env.VITE_RESERVAS_WS_URL || 'http://localhost:3004';

const createSeatBlueprint = (capacidadSala: number) => {
  const seatsPerRow = 12;
  const seatCount = Math.max(capacidadSala, 1);
  const rowsNeeded = Math.ceil(seatCount / seatsPerRow);
  const blueprint: Array<{ fila: string; numero: number }> = [];

  for (let rowIndex = 0; rowIndex < rowsNeeded; rowIndex += 1) {
    for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber += 1) {
      if (blueprint.length >= seatCount) {
        break;
      }

      blueprint.push({
        fila: ROW_LABELS[rowIndex] || `R${rowIndex + 1}`,
        numero: seatNumber,
      });
    }
  }

  return blueprint;
};

const SeleccionAsientos: React.FC<SeleccionAsientosProps> = ({
  pelicula,
  onConfirmarSeleccion,
}) => {
  const [asientos, setAsientos] = useState<UserAsiento[]>([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<UserAsiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockedSeatIds, setLockedSeatIds] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const loadAsientos = useCallback(async (resetSelection = false, showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    setError(null);

    if (resetSelection) {
      setAsientosSeleccionados([]);
    }

    try {
      let remoteSeats = await reservasService.getAsientosByFuncion(pelicula.funcionId);

      if (remoteSeats.length === 0) {
        const blueprint = createSeatBlueprint(pelicula.capacidadSala);

        await Promise.all(
          blueprint.map((seat) =>
            reservasService.createAsiento({
              fila: seat.fila,
              numero: seat.numero,
              idFuncionExterna: pelicula.funcionId,
            }),
          ),
        );

        remoteSeats = await reservasService.getAsientosByFuncion(pelicula.funcionId);
      }

      setAsientos(
        remoteSeats.map((seat) => ({
          id: seat.id,
          numero: seat.numero,
          fila: seat.fila,
          estado: seat.propio ? 'propio' : seat.ocupado ? 'ocupado' : 'disponible',
        })),
      );
    } catch (loadError) {
      console.error('No se pudo cargar el mapa de asientos', loadError);
      setError('No se pudieron cargar los asientos de esta funcion.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pelicula.capacidadSala, pelicula.funcionId]);

  useEffect(() => {
    void loadAsientos(true, true);
  }, [loadAsientos]);

  useEffect(() => {
    const reservasSocket = io(`${RESERVAS_WS_URL}/reservas`, {
      transports: ['websocket'],
    });

    setSocket(reservasSocket);

    reservasSocket.on('connect', () => {
      reservasSocket.emit('seats:join', { funcionId: pelicula.funcionId });
    });

    reservasSocket.on('seats:state', ({ funcionId, lockedSeatIds: nextLockedSeatIds }) => {
      if (funcionId !== pelicula.funcionId) {
        return;
      }

      setLockedSeatIds(nextLockedSeatIds);
    });

    reservasSocket.on('seats:availability-changed', ({ funcionId }) => {
      if (funcionId !== pelicula.funcionId) {
        return;
      }

      void loadAsientos();
    });

    return () => {
      reservasSocket.disconnect();
      setSocket(null);
      setLockedSeatIds([]);
    };
  }, [loadAsientos, pelicula.funcionId]);

  const handleAsientoClick = (asiento: UserAsiento) => {
    if (asiento.estado === 'ocupado' || asiento.estado === 'propio') {
      return;
    }

    const esSeleccionado = asientosSeleccionados.some((item) => item.id === asiento.id);

    if (esSeleccionado) {
      socket?.emit('seats:release', {
        funcionId: pelicula.funcionId,
        seatId: asiento.id,
      });
      setAsientosSeleccionados((current) => current.filter((item) => item.id !== asiento.id));
      setAsientos((current) =>
        current.map((item) =>
          item.id === asiento.id && item.estado !== 'ocupado'
            ? { ...item, estado: 'disponible' }
            : item,
        ),
      );
      return;
    }

    if (lockedSeatIds.includes(asiento.id)) {
      setError('Este asiento esta siendo seleccionado por otro usuario.');
      return;
    }

    if (asientosSeleccionados.length >= 10) {
      setError('Maximo 10 asientos por transaccion.');
      return;
    }

    setError(null);
    socket?.emit(
      'seats:select',
      {
        funcionId: pelicula.funcionId,
        seatId: asiento.id,
      },
      (response?: { success?: boolean; message?: string }) => {
        if (response?.success === false) {
          setError(response.message || 'No se pudo bloquear el asiento.');
          return;
        }

        setAsientosSeleccionados((current) => [...current, { ...asiento, estado: 'seleccionado' }]);
        setAsientos((current) =>
          current.map((item) =>
            item.id === asiento.id ? { ...item, estado: 'seleccionado' } : item,
          ),
        );
      },
    );
  };

  const handleEliminarSeleccion = (asientoId: string) => {
    socket?.emit('seats:release', {
      funcionId: pelicula.funcionId,
      seatId: asientoId,
    });
    setAsientosSeleccionados((current) => current.filter((item) => item.id !== asientoId));
    setAsientos((current) =>
      current.map((item) => (item.id === asientoId ? { ...item, estado: 'disponible' } : item)),
    );
  };

  const handleConfirmar = () => {
    if (asientosSeleccionados.length === 0) {
      setError('Selecciona al menos un asiento.');
      return;
    }

    const total = asientosSeleccionados.length * pelicula.precio;
    onConfirmarSeleccion(asientosSeleccionados, total);
  };

  const getColorAsiento = (estado: UserAsiento['estado']) => {
    switch (estado) {
      case 'disponible':
        return 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-cinema-gold-500 hover:to-cinema-gold-600 hover:text-black hover:shadow-lg hover:scale-110';
      case 'seleccionado':
        return 'bg-gradient-to-br from-cinema-gold-500 to-cinema-gold-600 text-black shadow-lg scale-105 ring-2 ring-white/50';
      case 'propio':
        return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg scale-105 ring-2 ring-blue-200/70';
      case 'ocupado':
        return 'bg-gradient-to-br from-green-700 to-green-800 cursor-not-allowed opacity-60';
      default:
        return 'bg-gray-600';
    }
  };

  const selectedSeatIds = useMemo(
    () => new Set(asientosSeleccionados.map((asiento) => asiento.id)),
    [asientosSeleccionados],
  );
  const lockedSeatIdsSet = useMemo(() => new Set(lockedSeatIds), [lockedSeatIds]);

  const asientosRender = useMemo(
    () =>
      asientos.map((asiento) => {
        if (asiento.estado === 'propio') {
          return asiento;
        }

        if (selectedSeatIds.has(asiento.id)) {
          return { ...asiento, estado: 'seleccionado' as const };
        }

        if (asiento.estado === 'ocupado') {
          return asiento;
        }

        if (lockedSeatIdsSet.has(asiento.id)) {
          return { ...asiento, estado: 'ocupado' as const };
        }

        return { ...asiento, estado: 'disponible' as const };
      }),
    [asientos, lockedSeatIdsSet, selectedSeatIds],
  );

  const asientosPorFila = useMemo(
    () =>
      asientosRender.reduce<Record<string, UserAsiento[]>>((acc, asiento) => {
        if (!acc[asiento.fila]) {
          acc[asiento.fila] = [];
        }

        acc[asiento.fila].push(asiento);
        return acc;
      }, {}),
    [asientosRender],
  );

  if (loading) {
    return (
      <div className="cinema-card p-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-cinema-gold-500 mx-auto" />
          <p className="text-gray-400 mt-6 text-lg">Cargando mapa de asientos...</p>
        </div>
      </div>
    );
  }

  if (error && asientos.length === 0) {
    return (
      <div className="cinema-card p-8 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const total = asientosSeleccionados.length * pelicula.precio;

  return (
    <div className="cinema-card p-8">
      <div className="bg-gradient-to-r from-cinema-dark-900 to-cinema-dark-800 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-cinema-red-500/20 rounded-full flex items-center justify-center">
              <FaFilm className="text-cinema-red-500 text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{pelicula.titulo}</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <FaCalendarAlt className="text-cinema-gold-500" />
                  <span>{pelicula.fecha}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaClock className="text-cinema-gold-500" />
                  <span>{pelicula.horario}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaTicketAlt className="text-cinema-gold-500" />
                  <span>Q{pelicula.precio} por asiento</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Capacidad sala</div>
            <div className="text-xs text-gray-500">{pelicula.capacidadSala} butacas</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8 mb-8 pb-6 border-b border-cinema-gold-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg shadow-md" />
          <span className="text-sm text-gray-300">Disponible</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cinema-gold-500 to-cinema-gold-600 rounded-lg shadow-md ring-1 ring-white/50" />
          <span className="text-sm text-gray-300">Seleccionado</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-700 to-green-800 rounded-lg opacity-60" />
          <span className="text-sm text-gray-300">Ocupado</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-md ring-1 ring-blue-200/70" />
          <span className="text-sm text-gray-300">Tus asientos</span>
        </div>
      </div>

      <div className="text-center mb-10">
        <div className="bg-gradient-to-r from-cinema-dark-900 via-cinema-dark-800 to-cinema-dark-900 py-4 rounded-xl mb-3 max-w-2xl mx-auto">
          <FaChair className="text-gray-500 text-2xl mx-auto mb-2" />
          <p className="text-gray-400 text-sm uppercase tracking-wider">Pantalla IMAX</p>
        </div>
        <div className="w-full max-w-4xl mx-auto h-1 bg-gradient-to-r from-transparent via-cinema-gold-500 to-transparent" />
      </div>

      <div className="overflow-x-auto mb-8">
        <div className="flex justify-center">
          <div className="min-w-max">
            {Object.entries(asientosPorFila).map(([fila, asientosFila]) => (
              <div key={fila} className="flex items-center gap-4 mb-3 justify-center">
                <div className="w-10 text-center font-bold text-cinema-gold-500 text-lg">{fila}</div>
                <div className="flex gap-2">
                  {asientosFila.map((asiento) => (
                    <button
                      key={asiento.id}
                      onClick={() => handleAsientoClick(asiento)}
                      disabled={asiento.estado === 'ocupado' || asiento.estado === 'propio'}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-200 ${getColorAsiento(asiento.estado)}`}
                    >
                      {asiento.numero}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 max-w-3xl mx-auto mb-6">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {asientosSeleccionados.length > 0 && (
        <div className="bg-gradient-to-r from-cinema-dark-900 to-cinema-dark-800 rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <FaTicketAlt className="text-cinema-gold-500" />
            Asientos seleccionados:
          </h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {asientosSeleccionados.map((asiento) => (
              <div
                key={asiento.id}
                className="flex items-center gap-2 bg-cinema-gold-500/20 px-4 py-2 rounded-full"
              >
                <span className="text-cinema-gold-500 font-bold text-lg">
                  {asiento.fila}
                  {asiento.numero}
                </span>
                <button
                  onClick={() => handleEliminarSeleccion(asiento.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between items-center pt-4 border-t border-cinema-gold-500/20">
            <div>
              <span className="text-gray-400 text-lg">Total a pagar:</span>
              <span className="text-cinema-gold-500 text-3xl font-bold ml-3">Q{total}</span>
            </div>
            <button
              onClick={handleConfirmar}
              className="bg-gradient-to-r from-cinema-red-500 to-cinema-red-600 hover:from-cinema-red-600 hover:to-cinema-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Continuar al Pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeleccionAsientos;
