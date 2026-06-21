// src/components/organisms/HistorialCompras/HistorialCompras.tsx

import { useState, useEffect } from 'react';
import { boletosService } from '../../../services/boletos.service';
import type { TicketHistoryItem, HistorialFiltros } from '../../../types/boletos.types';

// Componente para el badge de estado
const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    VALIDO: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      label: 'Activo'
    },
    USADO: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      label: 'Usado'
    }
  };

  const { bg, text, label } = config[estado] || {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    label: 'Desconocido'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
};

// Componente para el filtro de búsqueda
const FiltrosHistorial = ({
  filtros,
  onFiltroChange,
  onLimpiar
}: {
  filtros: HistorialFiltros;
  onFiltroChange: (filtros: Partial<HistorialFiltros>) => void;
  onLimpiar: () => void;
}) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Buscar</label>
          <input
            type="text"
            value={filtros.busqueda}
            onChange={(e) => onFiltroChange({ busqueda: e.target.value })}
            placeholder="Película o código QR..."
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinema-gold-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => onFiltroChange({ estado: e.target.value as HistorialFiltros['estado'] })}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinema-gold-500"
          >
            <option value="todos">Todos</option>
            <option value="VALIDO">Activos</option>
            <option value="USADO">Usados</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha desde</label>
          <input
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => onFiltroChange({ fechaInicio: e.target.value })}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinema-gold-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha hasta</label>
          <input
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => onFiltroChange({ fechaFin: e.target.value })}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinema-gold-500"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={onLimpiar}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

// Tarjeta individual de boleto
const TarjetaBoleta = ({
  boleta,
  onDescargar
}: {
  boleta: TicketHistoryItem;
  onDescargar: (id: string) => void;
}) => {
  const [showQR, setShowQR] = useState<boolean>(false);

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

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden hover:border-cinema-gold-500/50 transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {boleta.pelicula.titulo || 'Película no disponible'}
                </h3>
                <p className="text-sm text-gray-400">
                  {boleta.reserva.id} • {new Date(boleta.fechaEmision).toLocaleDateString('es-GT')}
                </p>
              </div>
              <EstadoBadge estado={boleta.estado} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              <div>
                <p className="text-xs text-gray-500">Código QR</p>
                <p className="text-sm text-gray-300 font-mono truncate">{boleta.codigoQr}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha y Hora</p>
                <p className="text-sm text-gray-300">
                  {formatFecha(boleta.funcion.fecha)} {formatHora(boleta.funcion.hora)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sala</p>
                <p className="text-sm text-gray-300">{boleta.funcion.sala || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Asientos</p>
                <p className="text-sm text-gray-300">
                  {boleta.asientos.length > 0
                    ? boleta.asientos.map((asiento) => `${asiento.fila}${asiento.numero}`).join(', ')
                    : 'No disponibles'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm text-cinema-gold-500 font-semibold">
                  Q{boleta.reserva.total.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <p className="text-sm text-gray-300">
                  {boleta.estado === 'VALIDO' ? '✓ Activo' : '✗ Usado'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-700">
            <button
              onClick={() => onDescargar(boleta.id)}
              disabled={boleta.estado !== 'VALIDO'}
              className="bg-cinema-gold-500 hover:bg-cinema-gold-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Boleto
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              {showQR ? 'Ocultar QR' : 'Ver QR'}
            </button>
          </div>

          {showQR && (
            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs text-center">
                    QR Code<br />
                    <span className="font-mono text-[10px]">{boleta.codigoQr}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal del Historial
const HistorialCompras = () => {
  const [boletos, setBoletos] = useState<TicketHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [filtros, setFiltros] = useState<HistorialFiltros>({
    busqueda: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'todos'
  });

  const cargarHistorial = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await boletosService.getHistorial(page, meta.limit, filtros);
      setBoletos(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('Error al cargar el historial:', err);
      setError('No se pudo cargar el historial de compras. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial(1);
  }, [filtros]);

  const cambiarPagina = (page: number) => {
    if (page >= 1 && page <= meta.totalPages) {
      cargarHistorial(page);
    }
  };

  const aplicarFiltros = (nuevosFiltros: Partial<HistorialFiltros>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'todos'
    });
  };

  const handleDescargar = async (id: string) => {
    try {
      await boletosService.descargarBoleto(id);
    } catch (err) {
      console.error('Error al descargar el boleto:', err);
      alert('No se pudo descargar el boleto. Intenta de nuevo.');
    }
  };

  const contarPorEstado = (estado: string) => {
    return boletos.filter((b) => b.estado === estado).length;
  };

  if (loading && boletos.length === 0) {
    return (
      <div className="cinema-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-gold-500 mx-auto" />
        <p className="text-gray-400 mt-4">Cargando historial...</p>
      </div>
    );
  }

  if (error && boletos.length === 0) {
    return (
      <div className="cinema-card p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => cargarHistorial(1)}
          className="mt-4 bg-cinema-gold-500 text-black px-4 py-2 rounded-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
          <p className="text-sm text-gray-400">Total de Boletos</p>
          <p className="text-2xl font-bold text-white">{meta.total}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
          <p className="text-sm text-green-400">Activos</p>
          <p className="text-2xl font-bold text-green-400">{contarPorEstado('VALIDO')}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <p className="text-sm text-blue-400">Usados</p>
          <p className="text-2xl font-bold text-blue-400">{contarPorEstado('USADO')}</p>
        </div>
        <div className="bg-gray-500/10 rounded-xl p-4 border border-gray-500/20">
          <p className="text-sm text-gray-400">Páginas</p>
          <p className="text-2xl font-bold text-gray-400">{meta.totalPages}</p>
        </div>
      </div>

      <FiltrosHistorial
        filtros={filtros}
        onFiltroChange={aplicarFiltros}
        onLimpiar={limpiarFiltros}
      />

      {boletos.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-12 text-center border border-gray-700">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-gray-400 text-lg">No tienes boletos en tu historial</p>
          <p className="text-gray-500 text-sm mt-1">Compra boletos en la cartelera para verlos aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {boletos.map((boleta) => (
            <TarjetaBoleta
              key={boleta.id}
              boleta={boleta}
              onDescargar={handleDescargar}
            />
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => cambiarPagina(meta.page - 1)}
            disabled={meta.page === 1}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-gray-400 text-sm">
            Página {meta.page} de {meta.totalPages}
          </span>
          <button
            onClick={() => cambiarPagina(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialCompras;