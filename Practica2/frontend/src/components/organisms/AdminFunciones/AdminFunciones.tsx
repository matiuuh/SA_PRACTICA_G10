import { useState } from 'react';
import { FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import type { Funcion, Pelicula, Sala } from '../../../types/admin.types';

interface AdminFuncionesProps {
  funciones: Funcion[];
  peliculas: Pelicula[];
  salas: Sala[];
  onAgregar: (funcion: Omit<Funcion, 'id'>) => void;
  onEditar: (funcion: Funcion) => void;
  onEliminar: (id: number) => void;
}

const AdminFunciones: React.FC<AdminFuncionesProps> = ({
  funciones,
  peliculas,
  salas,
  onAgregar,
  onEditar,
  onEliminar,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingFuncion, setEditingFuncion] = useState<Funcion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    peliculaId: '',
    salaId: 0,
    fecha: '',
    horario: '',
    precio: 45,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'precio' || name === 'salaId' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pelicula = peliculas.find((item) => item.id_pelicula === formData.peliculaId);
    const sala = salas.find((item) => item.id === formData.salaId);

    const nuevaFuncion: Omit<Funcion, 'id'> = {
      peliculaId: Number(formData.peliculaId) || 0,
      peliculaNombre: pelicula?.titulo || '',
      salaId: formData.salaId,
      salaNombre: sala?.nombre || '',
      localidadNombre: sala?.localidadNombre || '',
      fecha: formData.fecha,
      horario: formData.horario,
      precio: formData.precio,
    };

    if (editingFuncion) {
      onEditar({ ...editingFuncion, ...nuevaFuncion });
    } else {
      onAgregar(nuevaFuncion);
    }

    setShowModal(false);
    setEditingFuncion(null);
    setFormData({
      peliculaId: '',
      salaId: 0,
      fecha: '',
      horario: '',
      precio: 45,
    });
  };

  const funcionesFiltradas = funciones.filter((funcion) =>
    [funcion.peliculaNombre, funcion.localidadNombre, funcion.salaNombre]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="cinema-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gestion de Funciones</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cinema-red-500 hover:bg-cinema-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <FaPlus />
          Agregar Funcion
        </button>
      </div>

      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por pelicula, cine o sala..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cinema-gold-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 text-gray-400 font-semibold">Pelicula</th>
              <th className="pb-3 text-gray-400 font-semibold">Cine</th>
              <th className="pb-3 text-gray-400 font-semibold">Sala</th>
              <th className="pb-3 text-gray-400 font-semibold">Fecha</th>
              <th className="pb-3 text-gray-400 font-semibold">Horario</th>
              <th className="pb-3 text-gray-400 font-semibold">Precio</th>
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingFuncion(funcion)}
                      className="text-cinema-gold-500 hover:text-cinema-gold-400"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onEliminar(funcion.id)}
                      className="text-cinema-red-500 hover:text-cinema-red-400"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
            <div className="flex justify-between items-center p-6 border-b border-cinema-gold-500/20">
              <h2 className="text-xl font-bold text-white">
                {editingFuncion ? 'Editar Funcion' : 'Nueva Funcion'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Pelicula</label>
                <select
                  name="peliculaId"
                  required
                  value={formData.peliculaId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                >
                  <option value="">Seleccionar pelicula</option>
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
                  <option value={0}>Seleccionar sala</option>
                  {salas.map((sala) => (
                    <option key={sala.id} value={sala.id}>
                      {sala.nombre} - {sala.localidadNombre}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="block text-gray-300 text-sm mb-2">Horario</label>
                <input
                  type="time"
                  name="horario"
                  required
                  value={formData.horario}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Precio (Q)</label>
                <input
                  type="number"
                  name="precio"
                  required
                  min={20}
                  max={200}
                  value={formData.precio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-cinema-dark-900/50 border border-gray-700 rounded-lg text-white focus:border-cinema-gold-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600"
                >
                  {editingFuncion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFunciones;
