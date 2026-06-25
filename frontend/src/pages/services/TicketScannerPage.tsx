import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaQrcode } from 'react-icons/fa';
import MainLayout from '../../components/templates/MainLayout/MainLayout';
import AdminValidacionBoletos from '../../components/organisms/AdminValidacionBoletos/AdminValidacionBoletos';

const TicketScannerPage = () => {
  useEffect(() => {
    document.title = 'Escáner de boletos | FilmStars';
  }, []);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl py-2">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <FaQrcode className="text-3xl text-cinema-gold-500" />
              <h1 className="text-3xl font-bold text-white">Escáner de boletos</h1>
            </div>
            <p className="text-sm text-gray-400">Servicio independiente para el control de acceso.</p>
          </div>

          <Link
            to="/panel/admin"
            className="flex w-fit items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:border-cinema-gold-500/60 hover:text-cinema-gold-400"
          >
            <FaArrowLeft />
            Volver al panel
          </Link>
        </div>

        <AdminValidacionBoletos />
      </div>
    </MainLayout>
  );
};

export default TicketScannerPage;
