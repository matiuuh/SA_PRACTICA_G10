import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';

interface AdminActionButtonsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const actionButtonClass =
  'flex items-center justify-center gap-1.5 rounded px-2.5 py-1.5 text-sm transition-all';

const AdminActionButtons: React.FC<AdminActionButtonsProps> = ({ onView, onEdit, onDelete }) => (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={onView}
      title="Ver detalles"
      className={`${actionButtonClass} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30`}
    >
      <FaEye size={12} />
      Ver
    </button>
    <button
      type="button"
      onClick={onEdit}
      title="Editar"
      className={`${actionButtonClass} bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30`}
    >
      <FaEdit size={12} />
      Editar
    </button>
    <button
      type="button"
      onClick={onDelete}
      title="Eliminar"
      className={`${actionButtonClass} bg-red-500/20 text-red-400 hover:bg-red-500/30`}
    >
      <FaTrash size={12} />
      Eliminar
    </button>
  </div>
);

export default AdminActionButtons;
