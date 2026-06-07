import { useMemo, useState } from 'react';
import { FaCity, FaMapMarkerAlt, FaPlus, FaSearch, FaTheaterMasks } from 'react-icons/fa';
import Toast from '../../atoms/Toast/Toast';
import type { CreateLocalidadForm, Localidad } from '../../../types/admin.types';

interface AdminLocalidadesProps {
  localidades: Localidad[];
  isSaving?: boolean;
  onAgregar: (localidad: CreateLocalidadForm) => Promise<void>;
}

const initialForm: CreateLocalidadForm = {
  ciudad: '',
  cine: '',
  direccion: '',
};

const AdminLocalidades: React.FC<AdminLocalidadesProps> = ({ localidades, isSaving = false, onAgregar }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState<CreateLocalidadForm>(initialForm);

  const localidadesFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return localidades;
    }

    return localidades.filter((localidad) =>
      [localidad.ciudad, localidad.cine, localidad.direccion].join(' ').toLowerCase().includes(term),
    );
  }, [localidades, searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    if (isSaving) {
      return;
    }

    setShowModal(false);
    setFormData(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAgregar({
      ciudad: formData.ciudad.trim(),
      cine: formData.cine.trim(),
      direccion: formData.direccion.trim(),
    });
    setShowModal(false);
    setFormData(initialForm);
    setShowToast(true);
  };

  return (
    <>
      <div className="cinema-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Gestion de cines</h2>
            <p className="text-sm text-gray-400 mt-1">
              Esta vista crea ciudades y cines usando los endpoints disponibles del backend.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <FaPlus />
            Agregar cine
          </button>
        </div>

        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por ciudad, cine o direccion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localidadesFiltradas.map((localidad) => (
            <div
              key={localidad.id}
              className="bg-cinema-dark-900/50 rounded-lg p-4 border border-cinema-gold-500/20 hover:border-cinema-gold-500/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <FaCity className="text-cinema-gold-500" />
                <h3 className="font-bold text-white">{localidad.ciudad}</h3>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <FaTheaterMasks />
                <span>{localidad.cine}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FaMapMarkerAlt />
                <span>{localidad.direccion}</span>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
              <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
                <h2 className="text-xl font-bold text-white">Nuevo cine</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                  x
                </button>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    required
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Nombre del cine</label>
                  <input
                    type="text"
                    name="cine"
                    required
                    value={formData.cine}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Direccion</label>
                  <input
                    type="text"
                    name="direccion"
                    required
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Guardando...' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {showToast && <Toast message="Cine creado exitosamente" type="success" onClose={() => setShowToast(false)} />}
    </>
  );
};

export default AdminLocalidades;
