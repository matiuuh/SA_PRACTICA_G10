// src/components/organisms/AdminValidacionBoletos/AdminValidacionBoletos.tsx

import { useCallback, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import {
  FaQrcode,
  FaSearch,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaRedo,
  FaTicketAlt,
} from 'react-icons/fa';
import { reservasService } from '../../../services/reservas.service';
import { escaneoService } from '../../../services/escaneo.service';
import { boletosService } from '../../../services/boletos.service';
import Toast from '../../atoms/Toast/Toast';
import TicketQr from '../../atoms/TicketQr/TicketQr';
import AdminSeatMiniMap from '../AdminSeatMiniMap/AdminSeatMiniMap';
import TicketCameraScanner from '../TicketCameraScanner/TicketCameraScanner';
import type { BoletoValidacion, AdminBusquedaBoletosFiltros } from '../../../types/admin.types';

const AdminValidacionBoletos = () => {
  const [activeMode, setActiveMode] = useState<'scanner' | 'manual'>('scanner');
  const [validando, setValidando] = useState(false);
  const [scannerResetKey, setScannerResetKey] = useState(0);
  const [resultadoValidacion, setResultadoValidacion] = useState<{
    success: boolean;
    message: string;
    boleto?: BoletoValidacion;
  } | null>(null);

  const [filtros, setFiltros] = useState<AdminBusquedaBoletosFiltros>({
    page: 1,
    limit: 10,
  });
  const [resultadosBusqueda, setResultadosBusqueda] = useState<{
    data: BoletoValidacion[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  } | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [busquedaError, setBusquedaError] = useState<string | null>(null);
  const [validandoManualId, setValidandoManualId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showValidationToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleValidarCodigo = useCallback(async (codigo: string) => {
    const codigoAValidar = codigo.trim();

    if (!codigoAValidar) {
      showValidationToast('No se pudo leer un código QR válido.', 'error');
      return;
    }

    setValidando(true);
    setResultadoValidacion(null);

    try {
      const result = await escaneoService.validarBoleto(codigoAValidar);
      
      setResultadoValidacion({
        success: true,
        message: 'Boleto validado exitosamente',
        boleto: result,
      });
      showValidationToast('Boleto validado correctamente', 'success');
    } catch (error: unknown) {
      const mensaje = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || 'Error al validar el boleto'
        : 'Error al validar el boleto';
      setResultadoValidacion({
        success: false,
        message: mensaje,
      });
      showValidationToast(mensaje, 'error');
    } finally {
      setValidando(false);
    }
  }, []);

  const handleCodigoDetectado = useCallback((codigo: string) => {
    void handleValidarCodigo(codigo);
  }, [handleValidarCodigo]);

  const handleEscanearOtro = useCallback(() => {
    setResultadoValidacion(null);
    setScannerResetKey((current) => current + 1);
  }, []);

  const handleBuscarBoletos = useCallback(async (
    overrides?: Partial<AdminBusquedaBoletosFiltros>,
  ) => {
    const nextFilters = { ...filtros, ...overrides };

    if (
      nextFilters.fechaDesde &&
      nextFilters.fechaHasta &&
      nextFilters.fechaDesde > nextFilters.fechaHasta
    ) {
      const message = 'La fecha inicial no puede ser posterior a la fecha final';
      setBusquedaError(message);
      showValidationToast(message, 'error');
      return;
    }

    setBuscando(true);
    setBusquedaError(null);

    try {
      const params: AdminBusquedaBoletosFiltros = {
        ...nextFilters,
        page: nextFilters.page || 1,
        limit: nextFilters.limit || 10,
        identificador: nextFilters.identificador?.trim() || undefined,
        pelicula: nextFilters.pelicula?.trim() || undefined,
      };

      const result = await reservasService.buscarBoletosAdmin(params);
      setFiltros(nextFilters);
      setResultadosBusqueda({
        ...result,
        meta: { ...result.meta, totalPages: Math.max(1, result.meta.totalPages) },
      });
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || 'Error al buscar boletos'
        : 'Error al buscar boletos';
      setBusquedaError(message);
      showValidationToast(message, 'error');
    } finally {
      setBuscando(false);
    }
  }, [filtros]);

  const handleSubmitBusqueda = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleBuscarBoletos({ page: 1 });
  }, [handleBuscarBoletos]);

  const handleCambiarPagina = useCallback((page: number) => {
    setFiltros((prev) => ({ ...prev, page }));
    void handleBuscarBoletos({ page });
  }, [handleBuscarBoletos]);

  const handleValidarManual = useCallback(async (boletoId: string) => {
    if (!window.confirm('¿Confirmas que deseas marcar este boleto como utilizado?')) {
      return;
    }

    setValidandoManualId(boletoId);

    try {
      const boletoActualizado = await reservasService.validarBoletoManual(boletoId);
      setResultadosBusqueda((current) => current
        ? {
            ...current,
            data: current.data.map((boleto) =>
              boleto.id === boletoId ? boletoActualizado : boleto,
            ),
          }
        : current);
      showValidationToast('Boleto validado manualmente', 'success');
      await handleBuscarBoletos({
        page: resultadosBusqueda?.meta.page ?? 1,
      });
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || 'No se pudo validar el boleto'
        : 'No se pudo validar el boleto';
      showValidationToast(message, 'error');
    } finally {
      setValidandoManualId(null);
    }
  }, [handleBuscarBoletos, resultadosBusqueda?.meta.page]);

  const handleDescargar = useCallback(async (boletoId: string) => {
    try {
      await boletosService.descargarBoleto(boletoId);
    } catch {
      showValidationToast('No se pudo descargar el boleto', 'error');
    }
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      page: 1,
      limit: 10,
    });
    setResultadosBusqueda(null);
    setBusquedaError(null);
  }, []);

  // ========== RENDER: TARJETA DE BOLETO (ESTILO TICKET) ==========
  const renderBoletoDetalle = (boleto: BoletoValidacion, mostrarMapa = false) => {
    const estaActivo = boleto.estado === 'VALIDO';
    const asientosTexto = boleto.asientos.length > 0
      ? boleto.asientos.map((a) => `${a.fila}${a.numero}`).join(', ')
      : 'N/A';

    return (
      <div className="relative group mt-4">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cinema-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
        
        <div className="relative w-full max-w-md mx-auto transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl">
          
          <div className="relative bg-gradient-to-br from-[#8B0000] via-[#4A0000] to-black rounded-2xl overflow-hidden shadow-xl">
            
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-gray-900 rounded-r-full shadow-inner" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-gray-900 rounded-l-full shadow-inner" />

            <div className="relative px-8 py-6">
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cinema-gold-500/40 to-transparent" />
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FaTicketAlt className="text-cinema-gold-500 text-lg" />
                  <span className="text-lg font-bold text-white tracking-tight">FilmStars</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  estaActivo 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {estaActivo ? '● ACTIVO' : '● USADO'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">
                {boleto.pelicula.titulo || 'Película no disponible'}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Fecha</p>
                  <p className="text-white font-medium">{boleto.funcion.fecha || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Hora</p>
                  <p className="text-white font-medium">{boleto.funcion.hora || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Sala</p>
                  <p className="text-white font-medium">{boleto.funcion.sala || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Asientos</p>
                  <p className="text-cinema-gold-400 font-bold">{asientosTexto}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Total</p>
                  <p className="text-cinema-gold-400 font-bold text-lg">Q{boleto.reserva.total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Código</p>
                  <p className="text-white/60 font-mono text-xs truncate max-w-[120px]">
                    {boleto.codigoQr}
                  </p>
                </div>
              </div>

              <div className="relative my-3">
                <div className="border-t-2 border-dashed border-white/20" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#4A0000] px-3 py-0.5 rounded-full">
                  <span className="text-[10px] text-white/40 font-mono">✦</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-lg">
                    <TicketQr value={boleto.codigoQr} size={48} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Validado por</p>
                  <p className="text-white/70 text-sm font-medium">
                    {boleto.validadoPor || 'Pendiente'}
                  </p>
                  <p className="text-white/20 text-[9px] mt-0.5">
                    {new Date(boleto.fechaEmision).toLocaleString('es-GT')}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {estaActivo && (
                    <button
                      onClick={() => void handleValidarManual(boleto.id)}
                      disabled={validandoManualId === boleto.id}
                      className="flex-shrink-0 bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-50"
                    >
                      {validandoManualId === boleto.id ? 'Validando...' : 'Validar manual'}
                    </button>
                  )}
                  <button
                    onClick={() => void handleDescargar(boleto.id)}
                    className="flex-shrink-0 bg-cinema-gold-500 hover:bg-cinema-gold-400 text-black font-bold px-3 py-2 rounded-lg text-xs transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Descargar
                  </button>
                </div>
              </div>

              {mostrarMapa && <AdminSeatMiniMap boleto={boleto} />}

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cinema-gold-500/40 to-transparent" />
            </div>
          </div>

          <div className="absolute inset-0 rounded-2xl border border-cinema-gold-500/10 pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
        </div>
      </div>
    );
  };

  return (
    <div className="cinema-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FaQrcode className="text-cinema-gold-500 text-2xl" />
        <div>
          <h2 className="text-xl font-bold text-white">Validación de Boletos</h2>
          <p className="text-sm text-gray-400">Escanea códigos QR o busca boletos para validar accesos.</p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Método de validación"
        className="grid grid-cols-2 gap-1 rounded-xl border border-gray-700 bg-cinema-dark-900/70 p-1"
      >
        <button
          id="ticket-scanner-tab"
          type="button"
          role="tab"
          aria-controls="ticket-scanner-panel"
          aria-selected={activeMode === 'scanner'}
          onClick={() => setActiveMode('scanner')}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
            activeMode === 'scanner'
              ? 'bg-cinema-red-500 text-white shadow-lg shadow-cinema-red-500/20'
              : 'text-gray-400 hover:bg-cinema-dark-800 hover:text-white'
          }`}
        >
          <FaQrcode />
          Escanear boleto
        </button>
        <button
          id="ticket-manual-tab"
          type="button"
          role="tab"
          aria-controls="ticket-manual-panel"
          aria-selected={activeMode === 'manual'}
          onClick={() => setActiveMode('manual')}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
            activeMode === 'manual'
              ? 'bg-cinema-gold-500 text-cinema-dark-900 shadow-lg shadow-cinema-gold-500/20'
              : 'text-gray-400 hover:bg-cinema-dark-800 hover:text-white'
          }`}
        >
          <FaSearch />
          Validación manual
        </button>
      </div>

      {activeMode === 'scanner' && (
        <div
          id="ticket-scanner-panel"
          role="tabpanel"
          aria-labelledby="ticket-scanner-tab"
          className="bg-cinema-dark-900/50 rounded-xl p-5 border border-gray-700"
        >
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <FaQrcode className="text-cinema-gold-500" />
            Cámara de acceso
          </h3>

          {!resultadoValidacion && (
            <TicketCameraScanner
              disabled={validando}
              resetKey={scannerResetKey}
              onDetected={handleCodigoDetectado}
            />
          )}

          {resultadoValidacion && (
            <div className={`p-4 rounded-xl border ${
              resultadoValidacion.success
                ? 'bg-green-500/10 border-green-500/40'
                : 'bg-red-500/10 border-red-500/40'
            }`}>
              <p className={`font-semibold ${resultadoValidacion.success ? 'text-green-400' : 'text-red-400'}`}>
                {resultadoValidacion.message}
              </p>
              {resultadoValidacion.boleto && renderBoletoDetalle(resultadoValidacion.boleto, true)}
              <button
                type="button"
                onClick={handleEscanearOtro}
                className="mt-4 flex items-center gap-2 rounded-lg bg-cinema-gold-500 px-4 py-2 text-sm font-bold text-cinema-dark-900 transition-colors hover:bg-cinema-gold-400"
              >
                <FaRedo />
                Escanear otro boleto
              </button>
            </div>
          )}
        </div>
      )}

      {activeMode === 'manual' && (
        <div
          id="ticket-manual-panel"
          role="tabpanel"
          aria-labelledby="ticket-manual-tab"
          className="bg-cinema-dark-900/50 rounded-xl p-5 border border-gray-700"
        >
          <div className="mb-4">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <FaSearch className="text-cinema-gold-500" />
              Buscar boleto
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Localiza un boleto por sus datos y valida el acceso manualmente.
            </p>
          </div>

          <form onSubmit={handleSubmitBusqueda} className="space-y-4">
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
                  type="submit"
                  disabled={buscando}
                  className="flex-1 px-4 py-2 bg-cinema-gold-500 hover:bg-cinema-gold-400 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {buscando ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  title="Limpiar búsqueda"
                  aria-label="Limpiar búsqueda"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <FaRedo />
                </button>
              </div>
            </div>

            {busquedaError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {busquedaError}
              </div>
            )}

            {resultadosBusqueda && (
              <div className={`mt-4 space-y-4 transition-opacity ${buscando ? 'opacity-50' : ''}`}>
                <p className="text-sm text-gray-400">
                  Mostrando {resultadosBusqueda.data.length} de {resultadosBusqueda.meta.total} resultados
                </p>
                {resultadosBusqueda.data.length === 0 ? (
                  <div className="rounded-xl border border-gray-700 bg-cinema-dark-800/50 py-10 text-center">
                    <FaSearch className="mx-auto mb-3 text-3xl text-gray-600" />
                    <p className="font-medium text-gray-300">No se encontraron boletos</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Revisa el código, las fechas o elimina algún filtro.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
                    {resultadosBusqueda.data.map((boleto) => (
                      <div key={boleto.id}>
                        {renderBoletoDetalle(boleto)}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-700 pt-3">
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
              </div>
            )}

            {!resultadosBusqueda && !buscando && (
              <div className="text-center py-6 text-gray-500 text-sm">
                <FaSearch className="mx-auto text-3xl text-gray-600 mb-2" />
                Usa los filtros para buscar boletos en el sistema.
              </div>
            )}

            {buscando && !resultadosBusqueda && (
              <div className="text-center py-6">
                <FaSpinner className="animate-spin mx-auto text-cinema-gold-500 text-3xl" />
                <p className="text-gray-400 mt-2 text-sm">Buscando boletos...</p>
              </div>
            )}
          </form>
        </div>
      )}

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default AdminValidacionBoletos;
