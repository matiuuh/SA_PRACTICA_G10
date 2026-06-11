import { useMemo, useState } from 'react';
import { FaCouch, FaEdit, FaPlus, FaSearch, FaTheaterMasks, FaTrash, FaEye, FaInfoCircle, FaUsers, FaTag, FaBuilding } from 'react-icons/fa';
import Toast from '../../atoms/Toast/Toast';
import type { CreateSalaForm, Localidad, Sala } from '../../../types/admin.types';

interface AdminSalasProps {
  salas: Sala[];
  localidades: Localidad[];
  isSaving?: boolean;
  onAgregar: (sala: CreateSalaForm) => Promise<void>;
  onEditar: (sala: Sala) => Promise<void>;
  onEliminar: (id: string) => Promise<void>;
}

const initialForm: CreateSalaForm = {
  cineId: '',
  nombre: '',
  capacidad: 100,
  tipo: '2D',
};

const AdminSalas: React.FC<AdminSalasProps> = ({
  salas,
  localidades,
  isSaving = false,
  onAgregar,
  onEditar,
  onEliminar,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [selectedSala, setSelectedSala] = useState<Sala | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState<CreateSalaForm>(initialForm);

  const salasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return salas;
    }

    return salas.filter((sala) =>
      [sala.nombre, sala.localidadNombre, sala.ciudad, sala.tipo].join(' ').toLowerCase().includes(term),
    );
  }, [salas, searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacidad' ? Number(value) : value,
    }));
  };

  const handleCloseModal = () => {
    if (isSaving) {
      return;
    }

    setShowModal(false);
    setEditingSala(null);
    setFormData(initialForm);
  };

  const handleViewDetails = (sala: Sala) => {
    setSelectedSala(sala);
    setShowDetailsModal(true);
  };

  const handleEdit = (sala: Sala) => {
    setEditingSala(sala);
    setFormData({
      cineId: sala.cineId,
      nombre: sala.nombre,
      capacidad: sala.capacidad,
      tipo: sala.tipo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSala) {
      await onEditar({
        ...editingSala,
        cineId: formData.cineId,
        nombre: formData.nombre.trim(),
        capacidad: formData.capacidad,
        tipo: formData.tipo.trim(),
      });
      setToastMessage('Sala actualizada exitosamente');
    } else {
      await onAgregar({
        cineId: formData.cineId,
        nombre: formData.nombre.trim(),
        capacidad: formData.capacidad,
        tipo: formData.tipo.trim(),
      });
      setToastMessage('Sala creada exitosamente');
    }

    setShowToast(true);
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sala?')) {
      return;
    }

    await onEliminar(id);
    setToastMessage('Sala eliminada exitosamente');
    setShowToast(true);
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo.toLowerCase().includes('vip') || tipo.toLowerCase().includes('premium')) {
      return <FaCouch className="text-cinema-gold-500" />;
    }

    return <FaTheaterMasks className="text-gray-400" />;
  };

  const getTipoColor = (tipo: string) => {
    if (tipo.toLowerCase().includes('vip') || tipo.toLowerCase().includes('premium')) {
      return 'bg-cinema-gold-500/20 text-cinema-gold-500';
    }
    if (tipo.toLowerCase().includes('3d')) {
      return 'bg-blue-500/20 text-blue-500';
    }
    return 'bg-gray-500/20 text-gray-300';
  };

  return (
    <>
      <div className="cinema-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Gestión de Salas</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <FaPlus />
            Agregar sala
          </button>
        </div>

        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por sala, cine o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salasFiltradas.map((sala) => (
            <div
              key={sala.id}
              className="bg-cinema-dark-900/50 rounded-lg p-4 border border-cinema-gold-500/20 hover:border-cinema-gold-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {getTipoIcon(sala.tipo)}
                  <h3 className="font-bold text-white">{sala.nombre}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleViewDetails(sala)} className="text-blue-500 hover:text-blue-400" title="Ver detalles">
                    <FaEye />
                  </button>
                  <button onClick={() => handleEdit(sala)} className="text-cinema-gold-500 hover:text-cinema-gold-400">
                    <FaEdit />
                  </button>
                  <button onClick={() => void handleDelete(sala.id)} className="text-cinema-red-500 hover:text-cinema-red-400">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="text-gray-300 text-sm">{sala.localidadNombre}</div>
              <div className="text-gray-500 text-sm">{sala.ciudad}</div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                <span className="text-cinema-gold-500 font-bold">{sala.capacidad} asientos</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getTipoColor(sala.tipo)}`}>
                  {sala.tipo || 'General'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de detalles */}
        {showDetailsModal && selectedSala && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-cinema-dark-800 to-cinema-dark-900 rounded-2xl max-w-md w-full border border-cinema-gold-500/30 shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20 bg-cinema-dark-800/95">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaInfoCircle className="text-cinema-gold-500" />
                  Detalles de la Sala
                </h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white transition-colors text-2xl">
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cinema-gold-500/20 mb-3">
                    {getTipoIcon(selectedSala.tipo)}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{selectedSala.nombre}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaBuilding className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Cine</p>
                      <p className="text-white font-medium">{selectedSala.localidadNombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaTheaterMasks className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Ciudad</p>
                      <p className="text-white font-medium">{selectedSala.ciudad}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaUsers className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Capacidad</p>
                      <p className="text-white font-medium">{selectedSala.capacidad} asientos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaTag className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Tipo</p>
                      <p className={`font-medium ${getTipoColor(selectedSala.tipo)}`}>
                        {selectedSala.tipo || 'General'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-gray-500 text-xs">ID</p>
                  <p className="text-gray-500 text-sm font-mono break-all">{selectedSala.id}</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-cinema-gold-500/20 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedSala);
                  }}
                  className="px-4 py-2 rounded-lg bg-cinema-gold-500 text-black hover:bg-cinema-gold-400 transition-all flex items-center gap-2"
                >
                  <FaEdit /> Editar
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de agregar/editar sala */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
              <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
                <h2 className="text-xl font-bold text-white">{editingSala ? 'Editar sala' : 'Nueva sala'}</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Cine</label>
                  <select
                    name="cineId"
                    required
                    value={formData.cineId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  >
                    <option value="">Seleccionar cine</option>
                    {localidades.map((localidad) => (
                      <option key={localidad.id} value={localidad.id}>
                        {localidad.cine} - {localidad.ciudad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Nombre de la sala</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Tipo</label>
                    <input
                      type="text"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                      placeholder="2D, 3D, VIP, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Capacidad</label>
                    <input
                      type="number"
                      name="capacidad"
                      min={1}
                      required
                      value={formData.capacidad}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                    />
                  </div>
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
                    {isSaving ? 'Guardando...' : editingSala ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </>
  );
};

export default AdminSalas;