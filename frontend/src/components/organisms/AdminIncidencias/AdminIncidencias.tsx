import { useCallback, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaReply } from 'react-icons/fa';
import { incidenciasService } from '../../../services/incidencias.service';
import type { EstadoIncidencia, Incidencia } from '../../../types/incidencias.types';

const AdminIncidencias = () => {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [estado, setEstado] = useState<EstadoIncidencia | ''>('PENDIENTE');
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (page = 1, nextEstado = estado) => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await incidenciasService.getAdmin(page, meta.limit, nextEstado || undefined);
      setIncidencias(result.data);
      setMeta({ ...result.meta, totalPages: Math.max(1, result.meta.totalPages) });
    } catch {
      setMessage('No se pudieron cargar las incidencias.');
    } finally {
      setLoading(false);
    }
  }, [estado, meta.limit]);

  useEffect(() => {
    void load(1);
  }, [load]);

  const handleEstado = (value: EstadoIncidencia | '') => {
    setEstado(value);
    void load(1, value);
  };

  const handleRespond = async (incidencia: Incidencia) => {
    const respuesta = respuestas[incidencia.id]?.trim();
    if (!respuesta || respuesta.length < 3) {
      setMessage('Escribe una respuesta de al menos 3 caracteres.');
      return;
    }

    setRespondingId(incidencia.id);
    setMessage(null);
    try {
      await incidenciasService.respond(incidencia.id, respuesta);
      setRespuestas((current) => ({ ...current, [incidencia.id]: '' }));
      setMessage('Incidencia respondida y cerrada.');
      await load(meta.page);
    } catch {
      setMessage('No se pudo responder la incidencia.');
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="cinema-card p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Incidencias</h2>
          <p className="text-sm text-gray-400">Responde y cierra las incidencias enviadas por usuarios.</p>
        </div>
        <select
          value={estado}
          onChange={(event) => handleEstado(event.target.value as EstadoIncidencia | '')}
          className="rounded-lg border border-gray-700 bg-cinema-dark-800 px-3 py-2 text-white"
        >
          <option value="">Todas</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="RESPONDIDA">Respondidas</option>
        </select>
      </div>
      {message && <p className="mb-4 text-sm text-cinema-gold-400">{message}</p>}
      {loading ? (
        <p className="py-10 text-center text-gray-400">Cargando incidencias...</p>
      ) : incidencias.length === 0 ? (
        <p className="py-10 text-center text-gray-500">No hay incidencias para este filtro.</p>
      ) : (
        <div className="space-y-4">
          {incidencias.map((incidencia) => (
            <article key={incidencia.id} className="rounded-xl border border-gray-700 bg-cinema-dark-900/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-cinema-gold-500">{incidencia.tipo}</p>
                  <h3 className="font-semibold text-white">{incidencia.asunto}</h3>
                  <p className="mt-1 text-xs text-gray-500">Usuario: {incidencia.usuarioIdExterno}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  incidencia.estado === 'RESPONDIDA'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {incidencia.estado}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-300">{incidencia.descripcion}</p>
              <p className="mt-2 text-xs text-gray-500">
                {new Date(incidencia.fechaCreacion).toLocaleString('es-GT')}
              </p>
              {incidencia.estado === 'PENDIENTE' ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={respuestas[incidencia.id] || ''}
                    onChange={(event) => setRespuestas((current) => ({
                      ...current,
                      [incidencia.id]: event.target.value,
                    }))}
                    rows={3}
                    maxLength={1000}
                    placeholder="Escribe la respuesta administrativa..."
                    className="w-full resize-none rounded-lg border border-gray-700 bg-cinema-dark-800 px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => void handleRespond(incidencia)}
                    disabled={respondingId === incidencia.id}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    <FaReply />
                    {respondingId === incidencia.id ? 'Respondiendo...' : 'Responder y cerrar'}
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                  <p className="text-xs font-bold uppercase text-green-400">Respuesta</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-200">{incidencia.respuesta}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-700 pt-4">
        <span className="text-sm text-gray-500">Mostrando {incidencias.length} de {meta.total} incidencias</span>
        <div className="flex items-center gap-3">
          <button onClick={() => void load(meta.page - 1)} disabled={meta.page === 1} className="rounded-lg bg-gray-800 p-2 text-white disabled:opacity-40">
            <FaChevronLeft />
          </button>
          <span className="text-sm text-gray-400">Página {meta.page} de {meta.totalPages}</span>
          <button onClick={() => void load(meta.page + 1)} disabled={meta.page === meta.totalPages} className="rounded-lg bg-gray-800 p-2 text-white disabled:opacity-40">
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminIncidencias;
