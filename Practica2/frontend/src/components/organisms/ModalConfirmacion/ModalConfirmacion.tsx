import {
  FaCalendarAlt,
  FaChair,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaFilm,
  FaPrint,
  FaTicketAlt,
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  boleta: {
    id: string;
    pelicula: string;
    horario: string;
    fecha: string;
    asientos: string[];
    total: number;
    fechaCompra: string;
    metodoPago: string;
    detallePago: string;
  };
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  onClose,
  boleta,
}) => {
  if (!isOpen) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.setFillColor(24, 24, 27);
    pdf.rect(0, 0, 210, 297, 'F');

    pdf.setFillColor(220, 38, 38);
    pdf.roundedRect(18, 18, 174, 28, 6, 6, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('FILMSTARS', 105, 31, { align: 'center' });
    pdf.setFontSize(11);
    pdf.text('Boleto de compra', 105, 39, { align: 'center' });

    pdf.setFillColor(39, 39, 42);
    pdf.roundedRect(18, 54, 174, 120, 6, 6, 'F');

    pdf.setTextColor(245, 245, 245);
    pdf.setFontSize(16);
    pdf.text(boleta.pelicula, 28, 70);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);

    const detailLines = [
      ['Boleta', boleta.id],
      ['Fecha', boleta.fecha],
      ['Horario', boleta.horario],
      ['Asientos', boleta.asientos.join(', ')],
      ['Total', `Q${boleta.total}`],
      ['Metodo de pago', boleta.detallePago],
      ['Fecha de compra', boleta.fechaCompra],
    ];

    let y = 86;
    detailLines.forEach(([label, value]) => {
      pdf.setTextColor(161, 161, 170);
      pdf.text(`${label}:`, 28, y);
      pdf.setTextColor(255, 255, 255);
      pdf.text(value, 75, y);
      y += 14;
    });

    pdf.setDrawColor(212, 175, 55);
    pdf.line(28, 184, 182, 184);
    pdf.setTextColor(212, 175, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Gracias por tu compra. Disfruta tu funcion.', 105, 198, { align: 'center' });

    pdf.save(`boleta-${boleta.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-gradient-to-br from-cinema-dark-800 to-cinema-dark-900 rounded-2xl max-w-2xl w-full border border-cinema-gold-500/30 shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce">
              <FaCheckCircle className="text-green-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white">Compra Exitosa</h2>
            <p className="text-green-100 mt-2">Tu transaccion ha sido completada con exito</p>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-1 bg-cinema-gold-500/20 rounded-full">
              <span className="text-cinema-gold-500 text-sm font-semibold">BOLETO # {boleta.id}</span>
            </div>
          </div>

          <div className="bg-cinema-dark-900/50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FaFilm className="text-cinema-red-500 text-2xl" />
              <h3 className="text-xl font-bold text-white">{boleta.pelicula}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-300">
                <FaCalendarAlt className="text-cinema-gold-500" />
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm font-medium">{boleta.fecha}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <FaClock className="text-cinema-gold-500" />
                <div>
                  <p className="text-xs text-gray-500">Horario</p>
                  <p className="text-sm font-medium">{boleta.horario}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <FaChair className="text-cinema-gold-500" />
                <div>
                  <p className="text-xs text-gray-500">Asientos</p>
                  <p className="text-sm font-medium">{boleta.asientos.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <FaTicketAlt className="text-cinema-gold-500" />
                <div>
                  <p className="text-xs text-gray-500">Total pagado</p>
                  <p className="text-sm font-bold text-cinema-gold-500">Q{boleta.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-cinema-dark-900/30 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Metodo de pago:</span>
              <span className="text-white">{boleta.detallePago}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-400">Fecha de compra:</span>
              <span className="text-white">{boleta.fechaCompra}</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-xl">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FaTicketAlt className="text-cinema-gold-500 text-3xl mx-auto mb-1" />
                  <div className="text-[8px] text-gray-400 font-mono">{boleta.id}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white hover:bg-cinema-dark-700 transition-all"
            >
              <FaPrint />
              Imprimir
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2 bg-cinema-dark-800 border border-cinema-gold-500/30 rounded-lg text-white hover:bg-cinema-dark-700 transition-all"
            >
              <FaDownload />
              Descargar
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2 bg-cinema-red-500 hover:bg-cinema-red-600 rounded-lg text-white font-semibold transition-all"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
