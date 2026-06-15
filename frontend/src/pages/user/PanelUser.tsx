import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/templates/MainLayout/MainLayout';
import UserProfileHeader from '../../components/organisms/UserProfileHeader/UserProfileHeader';
import UserSubHeader from '../../components/organisms/UserSubHeader/UserSubHeader';
import Cartelera from '../../components/organisms/Cartelera/Cartelera';
import SeleccionAsientos from '../../components/organisms/SeleccionAsientos/SeleccionAsientos';
import ModalHorarios from '../../components/organisms/ModalHorarios/ModalHorarios';
import ModalPago, { type DatosPago } from '../../components/organisms/ModalPago/ModalPago';
import ModalConfirmacion from '../../components/organisms/ModalConfirmacion/ModalConfirmacion';
import Toast from '../../components/atoms/Toast/Toast';
import { authService } from '../../services/auth.service';
import { funcionesService } from '../../services/funciones.service';
import { pagosService } from '../../services/pagos.service';
import { reservasService } from '../../services/reservas.service';
import { type TabType } from '../../types/panel.types';
import type { Funcion } from '../../types/funciones.types';
import type {
  CarteleraCategoria,
  CarteleraPelicula,
  HorarioFuncion,
  UserAsiento,
} from '../../types/user-panel.types';

const CITY_STORAGE_KEY = 'selectedCity';
const CINEMA_STORAGE_KEY = 'selectedCinema';
const SELECTION_EVENT = 'filmstars-selection-changed';

interface BoletaGenerada {
  id: string;
  pelicula: string;
  horario: string;
  fecha: string;
  asientos: string[];
  total: number;
  fechaCompra: string;
  metodoPago: string;
  detallePago: string;
}

const normalizeCategoria = (nombre?: string | null): CarteleraCategoria => {
  const value = (nombre || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '');

  if (value === 'preventa') {
    return 'preventa';
  }

  if (value === 'reestreno') {
    return 'reestreno';
  }

  return 'estreno';
};

const formatDuration = (duracionMinutos?: number | null) => {
  if (!duracionMinutos || duracionMinutos <= 0) {
    return 'Duracion por confirmar';
  }

  const hours = Math.floor(duracionMinutos / 60);
  const minutes = duracionMinutos % 60;

  if (!hours) {
    return `${minutes} min`;
  }

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
};

const mapFuncionesToCartelera = (funciones: Funcion[]): CarteleraPelicula[] => {
  const grouped = new Map<string, CarteleraPelicula>();

  funciones.forEach((funcion) => {
    const peliculaId = funcion.pelicula.id;
    const categoria = normalizeCategoria(funcion.pelicula.tipoCartelera?.nombre);
    const existing = grouped.get(peliculaId);
    const horario: HorarioFuncion = {
      id: funcion.id,
      hora: funcion.hora,
      fecha: funcion.fecha,
      precio: Number(funcion.precio),
      salaNombre: funcion.sala.nombre,
      salaId: funcion.sala.id,
      capacidadSala: funcion.sala.capacidad,
    };

    if (!existing) {
      grouped.set(peliculaId, {
        id: peliculaId,
        titulo: funcion.pelicula.titulo,
        sinopsis: funcion.pelicula.sinopsis,
        genero: funcion.pelicula.categoria?.nombre || 'Cartelera general',
        duracion: formatDuration(funcion.pelicula.duracion_minutos),
        clasificacion: funcion.sala.tipo || 'General',
        imagen: normalizeImageUrl(funcion.pelicula.poster_url),
        categoria,
        tipoCartelera: funcion.pelicula.tipoCartelera?.nombre || 'Cartelera general',
        horarios: [horario],
      });
      return;
    }

    existing.horarios.push(horario);
  });

  return Array.from(grouped.values())
    .map((pelicula) => ({
      ...pelicula,
      horarios: [...pelicula.horarios].sort(
        (a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora),
      ),
    }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo));
};

const normalizeImageUrl = (url?: string | null) => {
  if (!url) {
    return '';
  }

  const trimmed = url.trim();

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return trimmed;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PanelUser = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [activeTab, setActiveTab] = useState<TabType>('cartelera');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
  const [peliculas, setPeliculas] = useState<CarteleraPelicula[]>([]);
  const [carteleraMeta, setCarteleraMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [carteleraPage, setCarteleraPage] = useState(1);
  const [carteleraLoading, setCarteleraLoading] = useState(false);
  const [carteleraError, setCarteleraError] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<CarteleraCategoria | 'todos'>('todos');
  const [selectedPelicula, setSelectedPelicula] = useState<CarteleraPelicula | null>(null);
  const [compraData, setCompraData] = useState<{
    pelicula: CarteleraPelicula;
    funcion: HorarioFuncion;
  } | null>(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<UserAsiento[]>([]);
  const [totalPago, setTotalPago] = useState(0);
  const [boletaGenerada, setBoletaGenerada] = useState<BoletaGenerada | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const lockLocationSelection = activeTab === 'seleccion-asientos' && Boolean(compraData);

  useEffect(() => {
    document.title = 'Mi Panel | FilmStars';

    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const syncSelection = () => {
      setSelectedCity(localStorage.getItem(CITY_STORAGE_KEY) || '');
      setSelectedCinema(localStorage.getItem(CINEMA_STORAGE_KEY) || '');
    };

    syncSelection();
    window.addEventListener(SELECTION_EVENT, syncSelection);

    return () => {
      window.removeEventListener(SELECTION_EVENT, syncSelection);
    };
  }, [navigate]);

  useEffect(() => {
    setCarteleraPage(1);
    setCategoriaActiva('todos');
  }, [selectedCinema]);

  useEffect(() => {
    if (!selectedCinema) {
      setPeliculas([]);
      setCarteleraMeta({ page: 1, limit: 10, total: 0, totalPages: 1 });
      setCarteleraError(null);
      return;
    }

    const loadCartelera = async () => {
      setCarteleraLoading(true);
      setCarteleraError(null);

      try {
        const result = await funcionesService.getCartelera(selectedCinema, carteleraPage, 10, categoriaActiva !== 'todos' ? categoriaActiva : undefined);
        setPeliculas(mapFuncionesToCartelera(result.data));
        setCarteleraMeta(result.meta);
      } catch (error) {
        console.error('No se pudo cargar la cartelera del cine seleccionado', error);
        setPeliculas([]);
        setCarteleraMeta({ page: 1, limit: 10, total: 0, totalPages: 1 });
        setCarteleraError('No se pudo cargar la cartelera en este momento.');
      } finally {
        setCarteleraLoading(false);
      }
    };

    void loadCartelera();
  }, [selectedCinema, carteleraPage, categoriaActiva]);

  const handleVerHorarios = (pelicula: CarteleraPelicula) => {
    setSelectedPelicula(pelicula);
    setModalOpen(true);
  };

  const handleConfirmarHorario = (funcion: HorarioFuncion) => {
    if (!selectedPelicula) {
      return;
    }

    setCompraData({
      pelicula: selectedPelicula,
      funcion,
    });
    setModalOpen(false);
    setSelectedPelicula(null);
    setActiveTab('seleccion-asientos');
  };

  const handleConfirmarSeleccionAsientos = (asientos: UserAsiento[], total: number) => {
    setAsientosSeleccionados(asientos);
    setTotalPago(total);
    setModalPagoOpen(true);
  };

  const buildPaymentDetail = (datosPago: DatosPago) => {
    const lastDigits = datosPago.numeroTarjeta.replace(/\s/g, '').slice(-4);
    return `Tarjeta de credito **** ${lastDigits}`;
  };

  const waitForReservationResult = async (reservaId: string, datosPago: DatosPago) => {
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const reserva = await reservasService.getReserva(reservaId);

      if (reserva.estado.nombre === 'CONFIRMADA') {
        const pagos = await pagosService.getPagosByReserva(reservaId);
        const pago = pagos[0];
        const boleto = reserva.boletos[0];

        if (!pago || !boleto) {
          throw new Error('La reserva fue confirmada, pero no se encontro el comprobante final.');
        }

        const boleta: BoletaGenerada = {
          id: boleto.codigoQr,
          pelicula: compraData?.pelicula.titulo || '',
          horario: compraData?.funcion.hora || '',
          fecha: compraData?.funcion.fecha || '',
          asientos: reserva.detalles.map(
            (detalle) => `${detalle.asiento.fila}${detalle.asiento.numero}`,
          ),
          total: Number(reserva.total),
          fechaCompra: new Date(boleto.fechaEmision).toLocaleString(),
          metodoPago: pago.metodo.nombre,
          detallePago: buildPaymentDetail(datosPago),
        };

        setBoletaGenerada(boleta);
        setModalConfirmacionOpen(true);
        setToast({ type: 'success', message: 'Pago aprobado y reserva confirmada.' });
        return;
      }

      if (reserva.estado.nombre === 'RECHAZADA') {
        throw new Error('El pago fue rechazado. Verifica los datos de tu tarjeta e intentalo de nuevo.');
      }

      await sleep(1500);
    }

    throw new Error('La confirmacion del pago esta tardando demasiado. Revisa el estado de la reserva.');
  };

  const handlePagar = async (datosPago: DatosPago) => {
    if (!user?.id || !compraData || asientosSeleccionados.length === 0) {
      setToast({ type: 'error', message: 'No se encontro la informacion completa de la compra.' });
      return;
    }

    try {
      setToast({ type: 'info', message: 'Enviando reserva y procesando pago...' });

      const reserva = await reservasService.createCheckout({
        usuarioIdExterno: user.id,
        asientosIds: asientosSeleccionados.map((asiento) => asiento.id),
        total: totalPago,
        metodoPago: datosPago.metodoPago,
        numeroTarjeta: datosPago.numeroTarjeta,
        nombreTitular: datosPago.nombreTitular,
        fechaExpiracion: datosPago.fechaExpiracion,
        cvv: datosPago.cvv,
      });

      setModalPagoOpen(false);
      await waitForReservationResult(reserva.id, datosPago);
    } catch (error) {
      console.error('No se pudo completar el checkout', error);
      setToast({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo completar la reservacion en este momento.',
      });
    }
  };

  const handleCerrarConfirmacion = () => {
    setModalConfirmacionOpen(false);
    setCompraData(null);
    setAsientosSeleccionados([]);
    setTotalPago(0);
    setBoletaGenerada(null);
    setActiveTab('cartelera');
  };

  const renderCartelera = () => {
    if (carteleraLoading) {
      return (
        <div className="cinema-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-gold-500 mx-auto" />
          <p className="text-gray-400 mt-4">Cargando cartelera...</p>
        </div>
      );
    }

    if (carteleraError) {
      return (
        <div className="cinema-card p-6 text-center">
          <p className="text-red-400">{carteleraError}</p>
        </div>
      );
    }

    return (
      <Cartelera
        peliculas={peliculas}
        meta={carteleraMeta}
        onPageChange={setCarteleraPage}
        onVerHorarios={handleVerHorarios}
        selectedCity={selectedCity}
        selectedCinema={selectedCinema}
        categoriaActiva={categoriaActiva}
        onCategoriaChange={(cat) => { setCategoriaActiva(cat); setCarteleraPage(1); }}
      />
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cartelera':
        return renderCartelera();
      case 'seleccion-asientos':
        if (compraData) {
          return (
            <SeleccionAsientos
              pelicula={{
                titulo: compraData.pelicula.titulo,
                horario: compraData.funcion.hora,
                fecha: compraData.funcion.fecha,
                funcionId: compraData.funcion.id,
                capacidadSala: compraData.funcion.capacidadSala,
                precio: compraData.funcion.precio,
              }}
              onConfirmarSeleccion={handleConfirmarSeleccionAsientos}
            />
          );
        }

        return (
          <div className="cinema-card p-6 text-center">
            <p className="text-gray-400">
              Primero selecciona una pelicula y un horario desde la cartelera.
            </p>
            <button
              onClick={() => setActiveTab('cartelera')}
              className="mt-4 bg-cinema-red-500 text-white px-4 py-2 rounded-lg"
            >
              Ir a Cartelera
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <MainLayout lockLocationSelection={lockLocationSelection}>
        <div className="w-full">
          <UserProfileHeader />
          <UserSubHeader activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-6">{renderContent()}</div>
        </div>
      </MainLayout>

      <ModalHorarios
        pelicula={selectedPelicula}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPelicula(null);
        }}
        onConfirm={handleConfirmarHorario}
      />

      <ModalPago
        isOpen={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        onPagar={handlePagar}
        total={totalPago}
        asientos={asientosSeleccionados.map((asiento) => `${asiento.fila}${asiento.numero}`)}
        pelicula={compraData?.pelicula.titulo || ''}
        horario={compraData?.funcion.hora || ''}
        fecha={compraData?.funcion.fecha || ''}
      />

      {boletaGenerada && (
        <ModalConfirmacion
          isOpen={modalConfirmacionOpen}
          onClose={handleCerrarConfirmacion}
          boleta={boletaGenerada}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === 'info' ? 5000 : 3500}
        />
      )}
    </>
  );
};

export default PanelUser;
