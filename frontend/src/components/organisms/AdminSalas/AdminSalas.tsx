import { useState, useEffect, useCallback } from 'react';
import { FaCouch, FaPlus, FaSearch, FaTheaterMasks, FaInfoCircle, FaUsers, FaTag, FaBuilding, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { funcionesService } from '../../../services/funciones.service';
import AdminActionButtons from '../../admin/AdminActionButtons';
import Toast from '../../atoms/Toast/Toast';
import ConfirmDialog from '../AdminLocalidades/ConfirmDialog';
import type { CreateSalaForm, Localidad, Sala } from '../../../types/admin.types';

interface AdminSalasProps {
  salas?: Sala[];
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
  localidades,
  isSaving = false,
  onAgregar,
  onEditar,
  onEliminar,
}) => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [isLoadingSalas, setIsLoadingSalas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [selectedSala, setSelectedSala] = useState<Sala | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalSalas, setTotalSalas] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [salaToDelete, setSalaToDelete] = useState<Sala | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CreateSalaForm>(initialForm);

  const showSalaToast = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast(false);
    setToastType(type);
    setToastMessage(message);
    window.setTimeout(() => setShowToast(true), 0);
  };

  const mapSala = useCallback((s: any, locs: Localidad[]): Sala => {
    const localidad = locs.find((l) => l.id === s.id_cine_externo);
    return {
      id: s.id,
      cineId: s.id_cine_externo,
      localidadNombre: localidad?.cine || 'Cine no encontrado',
      ciudad: localidad?.ciudad || 'Sin ciudad',
      nombre: s.nombre,
      capacidad: s.capacidad,
      tipo: s.tipo || 'General',
    };
  }, []);

  const loadSalas = useCallback(async (page: number, search: string) => {
    setIsLoadingSalas(true);
    try {
      const result = await funcionesService.getSalasPaginated({ page, limit: 10, search: search || undefined });
      setSalas(result.data.map((s) => mapSala(s, localidades)));
      setPaginaActual(result.meta.page);
      setTotalPaginas(Math.max(1, result.meta.totalPages));
      setTotalSalas(result.meta.total);
    } catch (error) {
      console.error('Error loading salas:', error);
    } finally {
      setIsLoadingSalas(false);
    }
  }, [localidades, mapSala]);

  useEffect(() => {
    void loadSalas(paginaActual, searchTerm);
  }, [paginaActual, searchTerm, loadSalas]);

  const salasFiltradas = salas;

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

    try {
      if (editingSala) {
        await onEditar({
          ...editingSala,
          cineId: formData.cineId,
          nombre: formData.nombre.trim(),
          capacidad: formData.capacidad,
          tipo: formData.tipo.trim(),
        });
        showSalaToast('Sala actualizada exitosamente');
      } else {
        await onAgregar({
          cineId: formData.cineId,
          nombre: formData.nombre.trim(),
          capacidad: formData.capacidad,
          tipo: formData.tipo.trim(),
        });
        showSalaToast('Sala creada exitosamente');
      }

      await loadSalas(paginaActual, searchTerm);
      setShowModal(false);
      setEditingSala(null);
      setFormData(initialForm);
    } catch (error) {
      console.error('Error guardando sala:', error);
      showSalaToast(editingSala ? 'No se pudo actualizar la sala' : 'No se pudo crear la sala', 'error');
    }
  };

  const handleDelete = async () => {
    if (!salaToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await onEliminar(salaToDelete.id);
      await loadSalas(paginaActual, searchTerm);
      setSalaToDelete(null);
      showSalaToast('Sala eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando sala:', error);
      showSalaToast('No se pudo eliminar la sala', 'error');
    } finally {
      setIsDeleting(false);
    }
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
      <div className="cinema-card p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-white">Gestión de Salas</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cinema-red-500 px-4 py-2 text-white transition-all hover:bg-cinema-red-600 sm:w-auto"
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPaginaActual(1); setSearchTerm(searchInput); } }}
            onBlur={() => { setPaginaActual(1); setSearchTerm(searchInput); }}
            className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
          />
        </div>
        {isLoadingSalas && <div className="text-center text-gray-400 py-4">Cargando salas...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salasFiltradas.map((sala) => (
            <div
              key={sala.id}
              className="bg-cinema-dark-900/50 rounded-lg p-4 border border-cinema-gold-500/20 hover:border-cinema-gold-500/50 transition-all"
            >
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  {getTipoIcon(sala.tipo)}
                  <h3 className="font-bold text-white">{sala.nombre}</h3>
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
              <div className="mt-3 pt-3 border-t border-cinema-gold-500/20">
                <AdminActionButtons
                  onView={() => handleViewDetails(sala)}
                  onEdit={() => handleEdit(sala)}
                  onDelete={() => setSalaToDelete(sala)}
                />
              </div>
            </div>
          ))}
        </div>

        {salasFiltradas.length === 0 && !isLoadingSalas && (
          <div className="text-center py-12 text-gray-400">No se encontraron salas</div>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-700 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-gray-400 text-sm">Mostrando {salasFiltradas.length} de {totalSalas} salas</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 rounded-lg bg-cinema-dark-800 text-gray-400 hover:bg-cinema-dark-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <FaChevronLeft className="text-xs" /> Anterior
              </button>
              <span className="text-gray-400 text-sm px-2">Página {paginaActual} de {totalPaginas}</span>
              <button
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 rounded-lg bg-cinema-dark-800 text-gray-400 hover:bg-cinema-dark-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Siguiente <FaChevronRight className="text-xs" />
              </button>
            </div>
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

      <ConfirmDialog
        isOpen={salaToDelete !== null}
        onClose={() => setSalaToDelete(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar Sala"
        message={`Estas seguro que deseas eliminar "${salaToDelete?.nombre}"? Esta accion no se puede deshacer.`}
        isLoading={isDeleting}
        loadingLabel="Eliminando..."
      />

      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
    </>
  );
};

export default AdminSalas;
