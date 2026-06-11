import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import ConfirmDialog from '../organisms/AdminLocalidades/ConfirmDialog';

interface AdminActionButtonsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  itemLabel?: string;
}

const actionButtonClass =
  'flex items-center justify-center gap-1.5 rounded px-2.5 py-1.5 text-sm transition-all';

const AdminActionButtons: React.FC<AdminActionButtonsProps> = ({
  onView,
  onEdit,
  onDelete,
  itemLabel = 'este registro',
}) => {
  const [pendingAction, setPendingAction] = useState<'view' | 'edit' | null>(null);

  const confirmPendingAction = () => {
    if (pendingAction === 'view') {
      onView();
    }

    if (pendingAction === 'edit') {
      onEdit();
    }

    setPendingAction(null);
  };

  const pendingCopy =
    pendingAction === 'view'
      ? {
          title: 'Ver detalles',
          message: `Deseas visualizar los detalles de ${itemLabel}?`,
          confirmLabel: 'Ver detalles',
        }
      : {
          title: 'Editar registro',
          message: `Deseas editar ${itemLabel}? Revisa los cambios antes de guardar.`,
          confirmLabel: 'Editar',
        };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPendingAction('view')}
          title="Ver detalles"
          className={`${actionButtonClass} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30`}
        >
          <FaEye size={12} />
          Ver
        </button>
        <button
          type="button"
          onClick={() => setPendingAction('edit')}
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

      <ConfirmDialog
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
        title={pendingCopy.title}
        message={pendingCopy.message}
        confirmLabel={pendingCopy.confirmLabel}
        confirmVariant="primary"
      />
    </>
  );
};

export default AdminActionButtons;
