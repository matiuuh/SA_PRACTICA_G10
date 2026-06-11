import { useEffect, useState } from 'react';
import type { Cine, Ciudad } from '../../../types/localidades.types';

interface CineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { nombre: string; direccion: string; idCiudad?: string; ciudad?: string }) => Promise<void>;
  cine?: Cine | null;
  ciudades: Ciudad[];
  isSaving?: boolean;
  title: string;
}

const CineModal: React.FC<CineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cine,
  ciudades,
  isSaving = false,
  title,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    idCiudad: '',
    ciudad: '',
  });
  const [usarNuevaCiudad, setUsarNuevaCiudad] = useState(false);

  useEffect(() => {
    if (cine) {
      setFormData({
        nombre: cine.nombre,
        direccion: cine.direccion,
        idCiudad: cine.ciudad.id,
        ciudad: '',
      });
      setUsarNuevaCiudad(false);
    } else {
      setFormData({
        nombre: '',
        direccion: '',
        idCiudad: ciudades[0]?.id || '',
        ciudad: '',
      });
      setUsarNuevaCiudad(ciudades.length === 0);
    }
  }, [cine, ciudades]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim(),
      idCiudad: usarNuevaCiudad ? undefined : formData.idCiudad,
      ciudad: usarNuevaCiudad ? formData.ciudad.trim() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
        <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Ciudad</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUsarNuevaCiudad(false)}
                disabled={ciudades.length === 0}
                className={`py-2 rounded-lg border text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  !usarNuevaCiudad
                    ? 'border-cinema-gold-500 bg-cinema-gold-500/20 text-cinema-gold-500'
                    : 'border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                Existente
              </button>
              <button
                type="button"
                onClick={() => setUsarNuevaCiudad(true)}
                className={`py-2 rounded-lg border text-sm transition-all ${
                  usarNuevaCiudad
                    ? 'border-cinema-gold-500 bg-cinema-gold-500/20 text-cinema-gold-500'
                    : 'border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                Nueva ciudad
              </button>
            </div>

            {usarNuevaCiudad ? (
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                required
                placeholder="Nombre de la ciudad"
                className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
              />
            ) : (
              <select
                value={formData.idCiudad}
                onChange={(e) => setFormData({ ...formData, idCiudad: e.target.value })}
                required
                className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
              >
                {ciudades.map((ciudad) => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Nombre del cine</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              required
              className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CineModal;
