import { useMemo, useState } from 'react';
import { FaPlus, FaSearch, FaClock, FaCalendarAlt, FaInfoCircle, FaFilm, FaTheaterMasks, FaBuilding, FaTag, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import AdminActionButtons from '../../admin/AdminActionButtons';
import Toast from '../../atoms/Toast/Toast';
import ConfirmDialog from '../AdminLocalidades/ConfirmDialog';
import type { CreateFuncionForm, Funcion, Pelicula, Sala } from '../../../types/admin.types';

interface AdminFuncionesProps {
  funciones: Funcion[];
  peliculas: Pelicula[];
  salas: Sala[];
  isSaving?: boolean;
  onAgregar: (funcion: CreateFuncionForm) => Promise<void>;
  onEditar: (funcion: Funcion) => Promise<void>;
  onEliminar: (id: string) => Promise<void>;
}

const initialForm: CreateFuncionForm = {
  peliculaId: '',
  salaId: '',
  fecha: '',
  horario: '',
  precio: 45,
  activa: true,
};

const AdminFunciones: React.FC<AdminFuncionesProps> = ({
  funciones,
  peliculas,
  salas,
  isSaving = false,
  onAgregar,
  onEditar,
  onEliminar,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingFuncion, setEditingFuncion] = useState<Funcion | null>(null);
  const [selectedFuncion, setSelectedFuncion] = useState<Funcion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateFuncionForm>(initialForm);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const funcionesFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return funciones;
    }

    return funciones.filter((funcion) =>
      [funcion.peliculaNombre, funcion.localidadNombre, funcion.salaNombre, funcion.fecha]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [funciones, searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'precio' 
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleCloseModal = () => {
    if (isSaving) {
      return;
    }

    setShowModal(false);
    setEditingFuncion(null);
    setFormData(initialForm);
  };

  const handleEdit = (funcion: Funcion) => {
    setEditingFuncion(funcion);
    setFormData({
      peliculaId: funcion.peliculaId,
      salaId: funcion.salaId,
      fecha: funcion.fecha,
      horario: funcion.horario,
      precio: Math.floor(funcion.precio),
      activa: funcion.activa,
    });
    setShowModal(true);
  };

  const handleViewDetails = (funcion: Funcion) => {
    setSelectedFuncion(funcion);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (funcion: Funcion) => {
    setSelectedFuncion(funcion);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFuncion) return;
    
    setIsDeleting(true);
    try {
      await onEliminar(selectedFuncion.id);
      setToastType('success');
      setToastMessage('Función eliminada exitosamente');
      setShowToast(true);
      setShowDeleteConfirm(false);
      setSelectedFuncion(null);
    } catch (error) {
      setToastType('error');
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setToastMessage(Array.isArray(message) ? message.join(', ') : message || 'No se pudo eliminar la función');
      } else {
        setToastMessage('No se pudo eliminar la función');
      }
      setShowToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFuncion) {
      try {
        await onEditar({
          ...editingFuncion,
          peliculaId: formData.peliculaId,
          salaId: formData.salaId,
          fecha: formData.fecha,
          horario: formData.horario,
          precio: formData.precio,
          activa: formData.activa,
        });
        setToastType('success');
        setToastMessage('Función actualizada exitosamente');
      } catch (error) {
        setToastType('error');
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;
          setToastMessage(Array.isArray(message) ? message.join(', ') : message || 'No se pudo actualizar la función');
        } else {
          setToastMessage('No se pudo actualizar la función');
        }
        setShowToast(true);
        return;
      }
    } else {
      try {
        await onAgregar(formData);
        setToastType('success');
        setToastMessage('Función creada exitosamente');
      } catch (error) {
        setToastType('error');
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;
          setToastMessage(Array.isArray(message) ? message.join(', ') : message || 'No se pudo crear la función');
        } else {
          setToastMessage('No se pudo crear la función');
        }
        setShowToast(true);
        return;
      }
    }

    setShowToast(true);
    handleCloseModal();
  };

  return (
    <>
      <div className="cinema-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Gestión de funciones</h2>
            <p className="text-sm text-gray-400 mt-1">Administra las funciones: crear, editar, eliminar y ver detalles.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <FaPlus />
            Agregar función
          </button>
        </div>

        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por película, cine o sala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-semibold">Película</th>
                <th className="pb-3 text-gray-400 font-semibold">Cine</th>
                <th className="pb-3 text-gray-400 font-semibold">Sala</th>
                <th className="pb-3 text-gray-400 font-semibold">Fecha</th>
                <th className="pb-3 text-gray-400 font-semibold">Hora</th>
                <th className="pb-3 text-gray-400 font-semibold">Precio</th>
                <th className="pb-3 text-gray-400 font-semibold">Estado</th>
                <th className="pb-3 text-gray-400 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {funcionesFiltradas.map((funcion) => (
                <tr key={funcion.id} className="border-b border-gray-800 hover:bg-white/5">
                  <td className="py-3 text-white">{funcion.peliculaNombre}</td>
                  <td className="py-3 text-gray-400">{funcion.localidadNombre}</td>
                  <td className="py-3 text-gray-400">{funcion.salaNombre}</td>
                  <td className="py-3 text-gray-400">{funcion.fecha}</td>
                  <td className="py-3 text-gray-400">{funcion.horario}</td>
                  <td className="py-3 text-cinema-gold-500">Q{funcion.precio}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${funcion.activa ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {funcion.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-3">
                    <AdminActionButtons
                      onView={() => handleViewDetails(funcion)}
                      onEdit={() => handleEdit(funcion)}
                      onDelete={() => handleDeleteClick(funcion)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {funcionesFiltradas.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No se encontraron funciones
          </div>
        )}

        {/* Modal de detalles */}
        {showDetailsModal && selectedFuncion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-cinema-dark-800 to-cinema-dark-900 rounded-2xl max-w-md w-full border border-cinema-gold-500/30 shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20 bg-cinema-dark-800/95">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaInfoCircle className="text-cinema-gold-500" />
                  Detalles de la Función
                </h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white transition-colors text-2xl">
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cinema-gold-500/20 mb-3">
                    <FaCalendarAlt className="text-3xl text-cinema-gold-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedFuncion.peliculaNombre}</h3>
                  <p className="text-gray-400">{selectedFuncion.fecha} - {selectedFuncion.horario}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaFilm className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Película</p>
                      <p className="text-white font-medium">{selectedFuncion.peliculaNombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaTheaterMasks className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Sala</p>
                      <p className="text-white font-medium">{selectedFuncion.salaNombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaBuilding className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Cine</p>
                      <p className="text-white font-medium">{selectedFuncion.localidadNombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaClock className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Fecha y Hora</p>
                      <p className="text-white font-medium">{selectedFuncion.fecha} - {selectedFuncion.horario}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaTag className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Precio</p>
                      <p className="text-cinema-gold-500 font-bold text-xl">Q{selectedFuncion.precio}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-cinema-dark-900/50 rounded-lg">
                    <FaInfoCircle className="text-cinema-gold-500 text-lg" />
                    <div>
                      <p className="text-gray-400 text-xs">Estado</p>
                      <p className={`font-medium ${selectedFuncion.activa ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedFuncion.activa ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-500 text-xs">ID de la Función</p>
                  <p className="text-gray-500 text-sm font-mono break-all">{selectedFuncion.id}</p>
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

        {/* Modal de creación/edición */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
              <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
                <h2 className="text-xl font-bold text-white">{editingFuncion ? 'Editar función' : 'Nueva función'}</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Película</label>
                  <select
                    name="peliculaId"
                    required
                    value={formData.peliculaId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  >
                    <option value="">Seleccionar película</option>
                    {peliculas.map((pelicula) => (
                      <option key={pelicula.id_pelicula} value={pelicula.id_pelicula}>
                        {pelicula.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Sala</label>
                  <select
                    name="salaId"
                    required
                    value={formData.salaId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  >
                    <option value="">Seleccionar sala</option>
                    {salas.map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        {sala.nombre} - {sala.localidadNombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Fecha</label>
                    <input
                      type="date"
                      name="fecha"
                      required
                      value={formData.fecha}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Hora</label>
                    <input
                      type="time"
                      name="horario"
                      required
                      value={formData.horario}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Precio (Q)</label>
                  <input
                    type="number"
                    name="precio"
                    min={1}
                    required
                    value={formData.precio}
                    onChange={handleChange}
                    step="1"
                    className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" name="activa" checked={formData.activa} onChange={handleChange} />
                  Activa
                </label>

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
                    {isSaving ? <FaSpinner className="animate-spin mx-auto" /> : (editingFuncion ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedFuncion(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Función"
        message={`¿Estás seguro que deseas eliminar la función de "${selectedFuncion?.peliculaNombre}" el ${selectedFuncion?.fecha} a las ${selectedFuncion?.horario}? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />

      {/* Toast de notificación */}
      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
    </>
  );
};

export default AdminFunciones;