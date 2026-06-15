import { useState, useEffect, useCallback } from 'react';
import { FaCity, FaMapMarkerAlt, FaPlus, FaSearch, FaTheaterMasks, FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AdminActionButtons from '../../admin/AdminActionButtons';
import Toast from '../../atoms/Toast/Toast';
import CineModal from './CineModal';
import ConfirmDialog from './ConfirmDialog';
import type { Cine, Ciudad } from '../../../types/localidades.types';
import { localidadesService } from '../../../services/localidades.service';

interface AdminLocalidadesProps {
  localidades?: any[];
  isSaving?: boolean;
  onAgregar?: (data: any) => Promise<void>;
}

const AdminLocalidades: React.FC<AdminLocalidadesProps> = () => {
  const [cines, setCines] = useState<Cine[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCines, setTotalCines] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCine, setSelectedCine] = useState<Cine | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const loadCines = useCallback(async (page: number, search: string) => {
    try {
      setIsLoading(true);
      const result = await localidadesService.getCinesPaginated({ page, limit: 10, search: search || undefined });
      setCines(result.data);
      setPaginaActual(result.meta.page);
      setTotalPaginas(result.meta.totalPages);
      setTotalCines(result.meta.total);
    } catch (error) {
      console.error('Error loading cines:', error);
      showToastMessage('Error al cargar los cines', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCines(paginaActual, searchTerm);
  }, [paginaActual, searchTerm, loadCines]);

  useEffect(() => {
    localidadesService.getCiudades().then(setCiudades).catch(console.error);
  }, []);

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };


  const getOrCreateCiudadId = async (data: { idCiudad?: string; ciudad?: string }) => {
    if (data.idCiudad) {
      return data.idCiudad;
    }

    const ciudadNombre = data.ciudad?.trim();

    if (!ciudadNombre) {
      throw new Error('Ingresa una ciudad.');
    }

    const ciudadExistente = ciudades.find(
      (ciudad) => ciudad.nombre.trim().toLowerCase() === ciudadNombre.toLowerCase(),
    );

    if (ciudadExistente) {
      return ciudadExistente.id;
    }

    const nuevaCiudad = await localidadesService.createCiudad({ nombre: ciudadNombre });
    return nuevaCiudad.id;
  };

  const handleCreate = async (data: { nombre: string; direccion: string; idCiudad?: string; ciudad?: string }) => {
    setIsSaving(true);
    try {
      const idCiudad = await getOrCreateCiudadId(data);

      await localidadesService.createCine({
        nombre: data.nombre,
        direccion: data.direccion,
        idCiudad,
      });
      await loadCines(paginaActual, searchTerm);
      showToastMessage('Cine creado exitosamente', 'success');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating cine:', error);
      showToastMessage(error instanceof Error ? error.message : 'Error al crear el cine', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (data: { nombre: string; direccion: string; idCiudad?: string; ciudad?: string }) => {
    if (!selectedCine) return;
    setIsSaving(true);
    try {
      const idCiudad = await getOrCreateCiudadId(data);

      await localidadesService.updateCine(selectedCine.id, {
        nombre: data.nombre,
        direccion: data.direccion,
        idCiudad,
      });
      await loadCines(paginaActual, searchTerm);
      showToastMessage('Cine actualizado exitosamente', 'success');
      setShowEditModal(false);
      setSelectedCine(null);
    } catch (error) {
      console.error('Error updating cine:', error);
      showToastMessage(error instanceof Error ? error.message : 'Error al actualizar el cine', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCine) return;
    setIsSaving(true);
    try {
      await localidadesService.deleteCine(selectedCine.id);
      await loadCines(paginaActual, searchTerm);
      showToastMessage('Cine eliminado exitosamente', 'success');
      setShowDeleteConfirm(false);
      setSelectedCine(null);
    } catch (error) {
      console.error('Error deleting cine:', error);
      showToastMessage('Error al eliminar el cine', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetails = (cine: Cine) => {
    setSelectedCine(cine);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <div className="cinema-card p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Cargando cines...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="cinema-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Gestión de Cines</h2>
            <p className="text-sm text-gray-400 mt-1">
              Administra los cines: crear, editar, eliminar y ver detalles.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
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
            placeholder="Buscar por ciudad, cine o dirección..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPaginaActual(1); setSearchTerm(searchInput); } }}
            onBlur={() => { setPaginaActual(1); setSearchTerm(searchInput); }}
            className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cines.map((cine) => (
            <div
              key={cine.id}
              className="bg-cinema-dark-900/50 rounded-lg p-4 border border-cinema-gold-500/20 hover:border-cinema-gold-500/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <FaCity className="text-cinema-gold-500" />
                <h3 className="font-bold text-white">{cine.ciudad.nombre}</h3>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <FaTheaterMasks />
                <span className="font-semibold">{cine.nombre}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <FaMapMarkerAlt />
                <span>{cine.direccion}</span>
              </div>

              <div className="pt-2 border-t border-cinema-gold-500/20">
                <AdminActionButtons
                  onView={() => handleViewDetails(cine)}
                  onEdit={() => {
                    setSelectedCine(cine);
                    setShowEditModal(true);
                  }}
                  onDelete={() => {
                    setSelectedCine(cine);
                    setShowDeleteConfirm(true);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {cines.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No se encontraron cines
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">Mostrando {cines.length} de {totalCines} cines</p>
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
        )}
      </div>

      {/* Modal de detalles para Cine */}
      {showDetailsModal && selectedCine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-cinema-dark-800 to-cinema-dark-900 rounded-2xl max-w-md w-full border border-cinema-gold-500/30 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20 bg-cinema-dark-800/95">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaInfoCircle className="text-cinema-gold-500" />
                Detalles del Cine
              </h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white transition-colors text-2xl">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cinema-gold-500/20 mb-3">
                  <FaTheaterMasks className="text-4xl text-cinema-gold-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">{selectedCine.nombre}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                  <FaCity className="text-cinema-gold-500 text-lg" />
                  <div>
                    <p className="text-gray-400 text-xs">Ciudad</p>
                    <p className="text-white font-medium">{selectedCine.ciudad.nombre}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                  <FaMapMarkerAlt className="text-cinema-gold-500 text-lg" />
                  <div>
                    <p className="text-gray-400 text-xs">Dirección</p>
                    <p className="text-white font-medium">{selectedCine.direccion}</p>
                  </div>
                </div>
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

      <CineModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        ciudades={ciudades}
        isSaving={isSaving}
        title="Nuevo Cine"
      />

      <CineModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCine(null);
        }}
        onSave={handleEdit}
        cine={selectedCine}
        ciudades={ciudades}
        isSaving={isSaving}
        title="Editar Cine"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedCine(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Cine"
        message={`¿Estás seguro que deseas eliminar "${selectedCine?.nombre}"? Esta acción no se puede deshacer.`}
        isLoading={isSaving}
      />

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </>
  );
};

export default AdminLocalidades;
