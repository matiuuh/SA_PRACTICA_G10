// src/components/organisms/AdminValidacionBoletos/AdminValidacionBoletos.tsx

import { useState, useCallback } from 'react';
import {
  FaQrcode,
  FaSearch,
  FaCheckCircle,
  FaSpinner,
  FaFilm,
  FaCalendarAlt,
  FaClock,
  FaChair,
  FaTag,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaRedo,
  FaTicketAlt,
} from 'react-icons/fa';
import { reservasService } from '../../../services/reservas.service';
import { boletosService } from '../../../services/boletos.service';
import Toast from '../../atoms/Toast/Toast';
import type { BoletoValidacion, AdminBusquedaBoletosFiltros } from '../../../types/admin.types';

const AdminValidacionBoletos = () => {
  // Estado para escaneo/validación
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [validando, setValidando] = useState(false);
  const [resultadoValidacion, setResultadoValidacion] = useState<{
    success: boolean;
    message: string;
    boleto?: BoletoValidacion;
  } | null>(null);

  // Estado para búsqueda avanzada
  const [busquedaActiva, setBusquedaActiva] = useState(false);
  const [filtros, setFiltros] = useState<AdminBusquedaBoletosFiltros>({
    page: 1,
    limit: 10,
  });
  const [resultadosBusqueda, setResultadosBusqueda] = useState<{
    data: BoletoValidacion[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  } | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showValidationToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // ========== VALIDACIÓN POR CÓDIGO QR ==========
  const handleValidarCodigo = useCallback(async () => {
    if (!codigoEscaneado.trim()) {
      showValidationToast('Ingresa un código QR para validar.', 'error');
      return;
    }

    setValidando(true);
    setResultadoValidacion(null);

    try {
      const result = await reservasService.validarBoleto(codigoEscaneado.trim());
      
      setResultadoValidacion({
        success: true,
        message: '✅ Boleto validado exitosamente',
        boleto: result,
      });
      showValidationToast('Boleto validado correctamente', 'success');
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 'Error al validar el boleto';
      setResultadoValidacion({
        success: false,
        message: `❌ ${mensaje}`,
      });
      showValidationToast(mensaje, 'error');
    } finally {
      setValidando(false);
    }
  }, [codigoEscaneado]);

  // ========== BÚSQUEDA AVANZADA ==========
  const handleBuscarBoletos = useCallback(async () => {
    setBuscando(true);
    setResultadosBusqueda(null);

    try {
      const params: any = {
        page: filtros.page || 1,
        limit: filtros.limit || 10,
      };

      if (filtros.identificador?.trim()) {
        params.identificador = filtros.identificador.trim();
      }
      if (filtros.pelicula?.trim()) {
        params.pelicula = filtros.pelicula.trim();
      }
      if (filtros.fechaDesde) {
        params.fechaDesde = filtros.fechaDesde;
      }
      if (filtros.fechaHasta) {
        params.fechaHasta = filtros.fechaHasta;
      }
      if (filtros.estado) {
        params.estado = filtros.estado;
      }

      const result = await reservasService.buscarBoletosAdmin(params);
      setResultadosBusqueda(result);
    } catch (error: any) {
      showValidationToast(error.response?.data?.message || 'Error al buscar boletos', 'error');
    } finally {
      setBuscando(false);
    }
  }, [filtros]);

  const handleCambiarPagina = useCallback((page: number) => {
    setFiltros((prev) => ({ ...prev, page }));
    setTimeout(() => handleBuscarBoletos(), 0);
  }, [handleBuscarBoletos]);

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      page: 1,
      limit: 10,
    });
    setResultadosBusqueda(null);
    setBusquedaActiva(false);
  }, []);

  // ========== RENDER: DETALLE DEL BOLETO ==========
  const renderBoletoDetalle = (boleto: BoletoValidacion) => (
    <div className="bg-cinema-dark-900/50 rounded-xl p-4 border border-cinema-gold-500/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaTicketAlt className="text-cinema-gold-500 text-xl" />
          <div>
            <p className="text-white font-semibold">{boleto.pelicula.titulo || 'Película no disponible'}</p>
            <p className="text-gray-400 text-sm font-mono">{boleto.codigoQr}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          boleto.estado === 'VALIDO'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {boleto.estado === 'VALIDO' ? '✓ ACTIVO' : '✗ USADO'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <FaFilm className="text-cinema-gold-500 text-xs" />
          <span className="text-gray-300">{boleto.pelicula.titulo || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-cinema-gold-500 text-xs" />
          <span className="text-gray-300">{boleto.funcion.fecha || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-cinema-gold-500 text-xs" />
          <span className="text-gray-300">{boleto.funcion.hora || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBuilding className="text-cinema-gold-500 text-xs" />
          <span className="text-gray-300">{boleto.funcion.sala || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaChair className="text-cinema-gold-500 text-xs" />
          <span className="text-gray-300">
            {boleto.asientos.length > 0
              ? boleto.asientos.map((a) => `${a.fila}${a.numero}`).join(', ')
              : 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaTag className="text-cinema-gold-500 text-xs" />
          <span className="text-cinema-gold-500 font-bold">Q{boleto.reserva.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-700/50 flex justify-between text-xs text-gray-500">
        <span>ID: {boleto.id}</span>
        <span>Emisión: {new Date(boleto.fechaEmision).toLocaleString('es-GT')}</span>
      </div>

      <button
        onClick={() => boletosService.descargarBoleto(boleto.id)}
        className="w-full mt-2 bg-cinema-gold-500 hover:bg-cinema-gold-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-all"
      >
        📄 Descargar Boleto
      </button>
    </div>
  );

  return (
    <div className="cinema-card p-6 space-y-6">
      {/* ===== TÍTULO ===== */}
      <div className="flex items-center gap-3">
        <FaQrcode className="text-cinema-gold-500 text-2xl" />
        <div>
          <h2 className="text-xl font-bold text-white">Validación de Boletos</h2>
          <p className="text-sm text-gray-400">Escanea códigos QR o busca boletos para validar accesos.</p>
        </div>
      </div>

      {/* ===== SECCIÓN DE ESCANEO ===== */}
      <div className="bg-cinema-dark-900/50 rounded-xl p-5 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <FaQrcode className="text-cinema-gold-500" />
          Escaneo rápido
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ingresa el código QR del boleto..."
            value={codigoEscaneado}
            onChange={(e) => setCodigoEscaneado(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleValidarCodigo(); }}
            className="flex-1 px-4 py-2.5 bg-cinema-dark-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none text-sm"
          />
          <button
            onClick={handleValidarCodigo}
            disabled={validando}
            className="px-6 py-2.5 bg-cinema-red-500 hover:bg-cinema-red-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validando ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            Validar
          </button>
        </div>

        {/* Resultado de validación */}
        {resultadoValidacion && (
          <div className={`mt-4 p-4 rounded-xl border ${
            resultadoValidacion.success
              ? 'bg-green-500/10 border-green-500/40'
              : 'bg-red-500/10 border-red-500/40'
          }`}>
            <p className={`font-semibold ${resultadoValidacion.success ? 'text-green-400' : 'text-red-400'}`}>
              {resultadoValidacion.message}
            </p>
            {resultadoValidacion.boleto && (
              <div className="mt-3">
                {renderBoletoDetalle(resultadoValidacion.boleto)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== SECCIÓN DE BÚSQUEDA AVANZADA ===== */}
      <div className="bg-cinema-dark-900/50 rounded-xl p-5 border border-gray-700">
        <button
          onClick={() => setBusquedaActiva(!busquedaActiva)}
          className="flex items-center gap-2 text-white font-semibold hover:text-cinema-gold-500 transition-colors"
        >
          <FaSearch />
          {busquedaActiva ? 'Ocultar búsqueda avanzada' : 'Búsqueda avanzada'}
        </button>

        {busquedaActiva && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">ID o Código QR</label>
                <input
                  type="text"
                  placeholder="BOL-XXXX..."
                  value={filtros.identificador || ''}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, identificador: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-800 border border-gray-700 rounded-lg text-white text-sm focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Película</label>
                <input
                  type="text"
                  placeholder="Título de la película..."
                  value={filtros.pelicula || ''}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, pelicula: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-800 border border-gray-700 rounded-lg text-white text-sm focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Estado</label>
                <select
                  value={filtros.estado || ''}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, estado: e.target.value as 'VALIDO' | 'USADO' | undefined }))}
                  className="w-full px-3 py-2 bg-cinema-dark-800 border border-gray-700 rounded-lg text-white text-sm focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value="">Todos</option>
                  <option value="VALIDO">Activos</option>
                  <option value="USADO">Usados</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Fecha desde</label>
                <input
                  type="date"
                  value={filtros.fechaDesde || ''}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, fechaDesde: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-800 border border-gray-700 rounded-lg text-white text-sm focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Fecha hasta</label>
                <input
                  type="date"
                  value={filtros.fechaHasta || ''}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, fechaHasta: e.target.value }))}
                  className="w-full px-3 py-2 bg-cinema-dark-800 border border-gray-700 rounded-lg text-white text-sm focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleBuscarBoletos}
                  disabled={buscando}
                  className="flex-1 px-4 py-2 bg-cinema-gold-500 hover:bg-cinema-gold-400 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {buscando ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                  Buscar
                </button>
                <button
                  onClick={handleLimpiarFiltros}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <FaRedo />
                </button>
              </div>
            </div>

            {/* Resultados de búsqueda */}
            {resultadosBusqueda && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-400">
                  Mostrando {resultadosBusqueda.data.length} de {resultadosBusqueda.meta.total} resultados
                </p>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {resultadosBusqueda.data.map((boleto) => (
                    <div key={boleto.id}>
                      {renderBoletoDetalle(boleto)}
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {resultadosBusqueda.meta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <button
                      onClick={() => handleCambiarPagina(resultadosBusqueda.meta.page - 1)}
                      disabled={resultadosBusqueda.meta.page === 1}
                      className="px-3 py-1.5 rounded-lg bg-cinema-dark-800 text-gray-400 hover:bg-cinema-dark-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <FaChevronLeft className="text-xs" /> Anterior
                    </button>
                    <span className="text-gray-400 text-sm">
                      Página {resultadosBusqueda.meta.page} de {resultadosBusqueda.meta.totalPages}
                    </span>
                    <button
                      onClick={() => handleCambiarPagina(resultadosBusqueda.meta.page + 1)}
                      disabled={resultadosBusqueda.meta.page === resultadosBusqueda.meta.totalPages}
                      className="px-3 py-1.5 rounded-lg bg-cinema-dark-800 text-gray-400 hover:bg-cinema-dark-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Siguiente <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {!resultadosBusqueda && !buscando && (
              <div className="text-center py-6 text-gray-500 text-sm">
                <FaSearch className="mx-auto text-3xl text-gray-600 mb-2" />
                Usa los filtros para buscar boletos en el sistema.
              </div>
            )}

            {buscando && (
              <div className="text-center py-6">
                <FaSpinner className="animate-spin mx-auto text-cinema-gold-500 text-3xl" />
                <p className="text-gray-400 mt-2 text-sm">Buscando boletos...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default AdminValidacionBoletos;