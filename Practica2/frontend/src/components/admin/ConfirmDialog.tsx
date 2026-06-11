interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-cinema-dark-800 rounded-2xl max-w-md w-full border border-cinema-gold-500/30">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-300 mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2 rounded-lg bg-cinema-red-500 text-white hover:bg-cinema-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;