import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { FaChevronLeft, FaChevronRight, FaPaperPlane } from 'react-icons/fa';
import { incidenciasService } from '../../../services/incidencias.service';
import type {
  Incidencia,
  TipoIncidencia,
} from '../../../types/incidencias.types';

const MisIncidencias = () => {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [tipo, setTipo] = useState<TipoIncidencia>('PROBLEMA');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await incidenciasService.getMine(page, meta.limit);
      setIncidencias(result.data);
      setMeta(result.meta);
    } catch {
      setMessage('No se pudieron cargar tus incidencias.');
    } finally {
      setLoading(false);
    }
  }, [meta.limit]);

  useEffect(() => {
    void load(1);
  }, [load]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await incidenciasService.create({ tipo, asunto, descripcion });
      setTipo('PROBLEMA');
      setAsunto('');
      setDescripcion('');
      setMessage('Incidencia enviada correctamente.');
      await load(1);
    } catch {
      setMessage('No se pudo registrar la incidencia. Revisa los datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="cinema-card space-y-4 p-6">
        <div>
          <h2 className="text-xl font-bold text-white">Nueva incidencia</h2>
          <p className="text-sm text-gray-400">
            Describe el problema para que un administrador pueda responderte.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Tipo</label>
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as TipoIncidencia)}
              className="w-full rounded-lg border border-gray-700 bg-cinema-dark-800 px-3 py-2 text-white"
            >
              <option value="PROBLEMA">Problema</option>
              <option value="SUGERENCIA">Sugerencia</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Asunto</label>
            <input
              value={asunto}
              onChange={(event) => setAsunto(event.target.value)}
              minLength={3}
              maxLength={120}
              required
              className="w-full rounded-lg border border-gray-700 bg-cinema-dark-800 px-3 py-2 text-white"
              placeholder="Resumen de la incidencia"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            minLength={10}
            maxLength={1000}
            required
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-700 bg-cinema-dark-800 px-3 py-2 text-white"
            placeholder="Explica qué sucedió..."
          />
          <p className="mt-1 text-right text-xs text-gray-500">{descripcion.length}/1000</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-cinema-red-500 px-5 py-2 font-semibold text-white disabled:opacity-50"
        >
          <FaPaperPlane />
          {saving ? 'Enviando...' : 'Enviar incidencia'}
        </button>
        {message && <p className="text-sm text-cinema-gold-400">{message}</p>}
      </form>

      <div className="cinema-card p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Mis incidencias</h2>
        {loading ? (
          <p className="py-8 text-center text-gray-400">Cargando incidencias...</p>
        ) : incidencias.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Aún no has enviado incidencias.</p>
        ) : (
          <div className="space-y-4">
            {incidencias.map((incidencia) => (
              <article key={incidencia.id} className="rounded-xl border border-gray-700 bg-cinema-dark-900/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-cinema-gold-500">{incidencia.tipo}</p>
                    <h3 className="font-semibold text-white">{incidencia.asunto}</h3>
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
                {incidencia.respuesta && (
                  <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                    <p className="text-xs font-bold uppercase text-green-400">Respuesta administrativa</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-200">{incidencia.respuesta}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
        {meta.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              onClick={() => void load(meta.page - 1)}
              disabled={meta.page === 1}
              className="rounded-lg bg-gray-800 p-2 text-white disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>
            <span className="text-sm text-gray-400">Página {meta.page} de {meta.totalPages}</span>
            <button
              onClick={() => void load(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="rounded-lg bg-gray-800 p-2 text-white disabled:opacity-40"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisIncidencias;
