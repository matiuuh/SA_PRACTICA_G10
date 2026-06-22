// src/components/organisms/HistorialCompras/HistorialCompras.tsx

import { useCallback, useEffect, useState } from 'react';
import { boletosService } from '../../../services/boletos.service';
import type { TicketHistoryItem, HistorialFiltros } from '../../../types/boletos.types';
import TarjetaBoleta from '../TarjetaBoleta/TarjetaBoleta';

// Filtros
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
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinema-gold-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => onFiltroChange({ estado: e.target.value as HistorialFiltros['estado'] })}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinema-gold-500 text-sm"
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
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinema-gold-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha hasta</label>
          <input
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => onFiltroChange({ fechaFin: e.target.value })}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinema-gold-500 text-sm"
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

// Componente principal
const HistorialCompras = () => {
  const [boletos, setBoletos] = useState<TicketHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    totalsByStatus: {
      validos: 0,
      usados: 0,
    },
  });
  const [filtros, setFiltros] = useState<HistorialFiltros>({
    busqueda: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'todos'
  });

  const cargarHistorial = useCallback(async (page: number = 1) => {
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
  }, [filtros, meta.limit]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void cargarHistorial(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [cargarHistorial]);

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
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total de Boletos — negro con dorado */}
        <div className="relative overflow-hidden bg-black rounded-xl p-4 border border-cinema-gold-500/60 shadow-[0_0_16px_rgba(212,175,55,0.15)] shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cinema-gold-500 to-transparent" />
          <p className="text-xs text-cinema-gold-500 uppercase tracking-wider font-semibold">Total de Boletos</p>
          <p className="text-3xl font-bold text-cinema-gold-500 mt-1">{meta.total}</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cinema-gold-500/40 to-transparent" />
        </div>

        {/* Activos — replica estética del boleto activo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#8B0000]/60 via-[#4A0000]/50 to-black/60 rounded-xl p-4 border border-cinema-red-500/40 shadow-lg">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-cinema-gold-500/40 to-transparent" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-6 bg-[#1A0F0A] rounded-r-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-6 bg-[#1A0F0A] rounded-l-full" />
          <p className="text-xs text-cinema-gold-500/70 uppercase tracking-wider font-semibold">Activos</p>
          <p className="text-3xl font-bold text-white mt-1">{meta.totalsByStatus.validos}</p>
        </div>

        {/* Usados — mismo look del boleto usado: gradiente rojo→negro + grayscale + opacity */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#8B0000]/60 via-[#4A0000]/50 to-black/60 rounded-xl p-4 border border-cinema-red-500/40 shadow-lg grayscale opacity-70">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-cinema-gold-500/40 to-transparent" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-6 bg-[#1A0F0A] rounded-r-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-6 bg-[#1A0F0A] rounded-l-full" />
          <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">Usados</p>
          <p className="text-3xl font-bold text-white mt-1">{meta.totalsByStatus.usados}</p>
        </div>

        {/* Página actual */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2C1810]/60 to-[#1A0F0A]/60 rounded-xl p-4 border border-cinema-warm-500/30 shadow-lg">
          <p className="text-xs text-cinema-cream-600/70 uppercase tracking-wider font-semibold">Página actual</p>
          <p className="text-3xl font-bold text-white mt-1">
            {meta.page}
            <span className="text-sm text-white/40 font-normal ml-1">/ {meta.totalPages}</span>
          </p>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosHistorial
        filtros={filtros}
        onFiltroChange={aplicarFiltros}
        onLimpiar={limpiarFiltros}
      />

      {/* Grid de boletos */}
      {boletos.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-12 text-center border border-gray-700">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-gray-400 text-lg">No tienes boletos en tu historial</p>
          <p className="text-gray-500 text-sm mt-1">Compra boletos en la cartelera para verlos aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boletos.map((boleta) => (
            <TarjetaBoleta
              key={boleta.id}
              boleta={boleta}
              onDescargar={handleDescargar}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
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
