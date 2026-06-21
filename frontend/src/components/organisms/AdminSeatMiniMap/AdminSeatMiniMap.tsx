import { useEffect, useMemo, useState } from 'react';
import { FaChair } from 'react-icons/fa';
import { reservasService } from '../../../services/reservas.service';
import type { BoletoValidacion } from '../../../types/admin.types';
import type { ReservaAsiento } from '../../../types/reservas.types';

interface AdminSeatMiniMapProps {
  boleto: BoletoValidacion;
}

const AdminSeatMiniMap = ({ boleto }: AdminSeatMiniMapProps) => {
  const [result, setResult] = useState<{
    funcionId: string;
    asientos: ReservaAsiento[];
    error: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;

    if (!boleto.funcion.id) {
      return;
    }

    void reservasService
      .getAsientosByFuncion(boleto.funcion.id)
      .then((data) => {
        if (active) {
          setResult({
            funcionId: boleto.funcion.id!,
            asientos: data,
            error: false,
          });
        }
      })
      .catch(() => {
        if (active) {
          setResult({
            funcionId: boleto.funcion.id!,
            asientos: [],
            error: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [boleto.funcion.id, boleto.estado]);

  const isCurrentResult = result?.funcionId === boleto.funcion.id;
  const asientos = useMemo(
    () => (result?.funcionId === boleto.funcion.id ? result.asientos : []),
    [boleto.funcion.id, result],
  );
  const loading = !isCurrentResult;
  const error = isCurrentResult && result.error;

  const ticketSeatIds = useMemo(
    () => new Set(boleto.asientos.map((asiento) => asiento.id)),
    [boleto.asientos],
  );

  const asientosPorFila = useMemo(
    () =>
      asientos.reduce<Record<string, ReservaAsiento[]>>((rows, asiento) => {
        if (!rows[asiento.fila]) rows[asiento.fila] = [];
        rows[asiento.fila].push(asiento);
        return rows;
      }, {}),
    [asientos],
  );

  if (!boleto.funcion.id) {
    return (
      <p className="mt-4 text-center text-xs text-white/40">
        No hay una función asociada para mostrar el mapa.
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaChair className="text-cinema-gold-500" />
          <div>
            <p className="text-sm font-semibold text-white">Mapa de la sala</p>
            <p className="text-[10px] text-white/40">
              {boleto.funcion.sala || 'Sala no disponible'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 text-[9px] text-white/60">
          <span className="flex items-center gap-1">
            <i className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Comprado
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> Validado
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2.5 w-2.5 rounded-sm bg-gray-700" /> Otro
          </span>
        </div>
      </div>

      <div className="mx-auto mb-4 h-1.5 w-3/4 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <p className="-mt-3 mb-3 text-center text-[8px] uppercase tracking-[0.3em] text-white/30">
        Pantalla
      </p>

      {loading ? (
        <div className="py-5 text-center text-xs text-white/40">Cargando mapa...</div>
      ) : error ? (
        <div className="py-5 text-center text-xs text-red-300">
          No se pudo cargar el mapa de la sala.
        </div>
      ) : asientos.length === 0 ? (
        <div className="py-5 text-center text-xs text-white/40">
          No hay asientos registrados para esta función.
        </div>
      ) : (
        <div className="max-h-56 overflow-auto">
          <div className="mx-auto min-w-max space-y-1.5">
            {Object.entries(asientosPorFila)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([fila, seats]) => (
                <div key={fila} className="flex items-center justify-center gap-1.5">
                  <span className="w-5 text-center text-[9px] font-bold text-cinema-gold-500">
                    {fila}
                  </span>
                  {seats
                    .sort((a, b) => a.numero - b.numero)
                    .map((asiento) => {
                      const esDelBoleto = ticketSeatIds.has(asiento.id);
                      const estado = esDelBoleto
                        ? boleto.estado === 'USADO'
                          ? 'VALIDADO'
                          : 'COMPRADO'
                        : asiento.estadoAdministrativo ?? 'OTRO';
                      const color =
                        estado === 'VALIDADO'
                          ? 'bg-emerald-600 text-white'
                          : estado === 'COMPRADO'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-400';

                      return (
                        <div
                          key={asiento.id}
                          title={`${fila}${asiento.numero} · ${estado.toLowerCase()}`}
                          className={`flex h-6 w-6 items-center justify-center rounded text-[8px] font-bold ${color} ${
                            esDelBoleto ? 'ring-2 ring-cinema-gold-400 ring-offset-1 ring-offset-black' : ''
                          }`}
                        >
                          {asiento.numero}
                        </div>
                      );
                    })}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeatMiniMap;
