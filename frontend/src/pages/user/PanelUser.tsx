// src/pages/PanelUser/PanelUser.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationCircle, FaFilm, FaHistory } from 'react-icons/fa';
import UserLayout from '../../components/templates/UserLayout/UserLayout';
import Cartelera from '../../components/organisms/Cartelera/Cartelera';
import CarteleraLocationFilter from '../../components/organisms/CarteleraLocationFilter/CarteleraLocationFilter';
import SeleccionAsientos from '../../components/organisms/SeleccionAsientos/SeleccionAsientos';
import ModalHorarios from '../../components/organisms/ModalHorarios/ModalHorarios';
import ModalPago, { type DatosPago } from '../../components/organisms/ModalPago/ModalPago';
import ModalConfirmacion from '../../components/organisms/ModalConfirmacion/ModalConfirmacion';
import Toast from '../../components/atoms/Toast/Toast';
import HistorialCompras from '../../components/organisms/HistorialCompras/HistorialCompras';
import MisIncidencias from '../../components/organisms/MisIncidencias/MisIncidencias';
import { authService } from '../../services/auth.service';
import { funcionesService } from '../../services/funciones.service';
import { localidadesService } from '../../services/localidades.service';
import { pagosService } from '../../services/pagos.service';
import { reservasService } from '../../services/reservas.service';
import { type TabType } from '../../types/panel.types';
import type { Funcion } from '../../types/funciones.types';
import type { Cine, Ciudad } from '../../types/localidades.types';
import type {
  CarteleraCategoria,
  CarteleraPelicula,
  HorarioFuncion,
  UserAsiento,
} from '../../types/user-panel.types';

const CITY_STORAGE_KEY = 'selectedCity';
const CINEMA_STORAGE_KEY = 'selectedCinema';

const USER_NAVIGATION_ITEMS = [
  { id: 'cartelera' as TabType, label: 'Cartelera', description: 'Películas y horarios', icon: FaFilm },
  { id: 'historial' as TabType, label: 'Mis boletos', description: 'Compras y descargas', icon: FaHistory },
  { id: 'incidencias' as TabType, label: 'Incidencias', description: 'Ayuda y seguimiento', icon: FaExclamationCircle },
];

interface BoletaGenerada {
  id: string;           // UUID del boleto para descarga
  codigoQr: string;     // Código QR para mostrar
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
  const [cities, setCities] = useState<Ciudad[]>([]);
  const [cinemas, setCinemas] = useState<Cine[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [cinemasLoading, setCinemasLoading] = useState(false);
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
  useEffect(() => {
    document.title = 'Mi Panel | FilmStars';

    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadCities = async () => {
      setCitiesLoading(true);

      try {
        const loadedCities = await localidadesService.getCiudades();
        const savedCity = localStorage.getItem(CITY_STORAGE_KEY);
        const validSavedCity = savedCity && loadedCities.some((city) => city.id === savedCity)
          ? savedCity
          : '';

        setCities(loadedCities);
        setSelectedCity(validSavedCity);

        if (!validSavedCity) {
          localStorage.removeItem(CITY_STORAGE_KEY);
          localStorage.removeItem(CINEMA_STORAGE_KEY);
        }
      } catch (error) {
        console.error('No se pudieron cargar las ciudades', error);
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };

    void loadCities();
  }, [navigate]);

  useEffect(() => {
    if (!selectedCity) {
      setCinemas([]);
      setSelectedCinema('');
      return;
    }

    const loadCinemas = async () => {
      setCinemasLoading(true);

      try {
        const loadedCinemas = await localidadesService.getCinesByCiudad(selectedCity);
        const savedCinema = localStorage.getItem(CINEMA_STORAGE_KEY);
        const validSavedCinema = savedCinema && loadedCinemas.some((cinema) => cinema.id === savedCinema)
          ? savedCinema
          : '';

        setCinemas(loadedCinemas);
        setSelectedCinema(validSavedCinema);

        if (!validSavedCinema) localStorage.removeItem(CINEMA_STORAGE_KEY);
      } catch (error) {
        console.error('No se pudieron cargar los cines', error);
        setCinemas([]);
        setSelectedCinema('');
      } finally {
        setCinemasLoading(false);
      }
    };

    void loadCinemas();
  }, [selectedCity]);

  useEffect(() => {
    setCarteleraPage(1);
    setCategoriaActiva('todos');
  }, [selectedCinema]);

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedCinema('');
    setCarteleraPage(1);

    if (cityId) {
      localStorage.setItem(CITY_STORAGE_KEY, cityId);
    } else {
      localStorage.removeItem(CITY_STORAGE_KEY);
    }

    localStorage.removeItem(CINEMA_STORAGE_KEY);
  };

  const handleCinemaChange = (cinemaId: string) => {
    setSelectedCinema(cinemaId);
    setCarteleraPage(1);

    if (cinemaId) {
      localStorage.setItem(CINEMA_STORAGE_KEY, cinemaId);
    } else {
      localStorage.removeItem(CINEMA_STORAGE_KEY);
    }
  };

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
          id: boleto.id,                    // UUID para descarga
          codigoQr: boleto.codigoQr,        // Código QR para mostrar
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

  const handleSectionChange = (tab: TabType) => {
    if (compraData) {
      setCompraData(null);
      setAsientosSeleccionados([]);
      setTotalPago(0);
    }

    setActiveTab(tab);
  };

  const handleBackToCartelera = () => {
    setCompraData(null);
    setAsientosSeleccionados([]);
    setTotalPago(0);
    setActiveTab('cartelera');
  };

  const renderCartelera = () => {
    const locationFilter = (
      <CarteleraLocationFilter
        cities={cities}
        cinemas={cinemas}
        selectedCity={selectedCity}
        selectedCinema={selectedCinema}
        citiesLoading={citiesLoading}
        cinemasLoading={cinemasLoading}
        onCityChange={handleCityChange}
        onCinemaChange={handleCinemaChange}
      />
    );

    if (carteleraLoading) {
      return (
        <>
          {locationFilter}
          <div className="cinema-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-gold-500 mx-auto" />
            <p className="text-gray-400 mt-4">Cargando cartelera...</p>
          </div>
        </>
      );
    }

    if (carteleraError) {
      return (
        <>
          {locationFilter}
          <div className="cinema-card p-6 text-center">
            <p className="text-red-400">{carteleraError}</p>
          </div>
        </>
      );
    }

    return (
      <>
        {locationFilter}
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
      </>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cartelera':
        if (compraData) {
          return (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleBackToCartelera}
                  className="flex w-fit items-center gap-2 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
                >
                  <FaArrowLeft />
                  Volver a cartelera
                </button>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-full bg-cinema-red-500 px-2.5 py-1 font-bold text-white">1</span>
                  <span>Película y horario</span>
                  <span className="h-px w-5 bg-gray-700" />
                  <span className="rounded-full bg-cinema-gold-500 px-2.5 py-1 font-bold text-black">2</span>
                  <span className="text-gray-300">Asientos</span>
                  <span className="h-px w-5 bg-gray-700" />
                  <span className="rounded-full bg-gray-800 px-2.5 py-1 font-bold text-gray-500">3</span>
                  <span>Pago</span>
                </div>
              </div>
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
            </div>
          );
        }

        return renderCartelera();
      case 'historial':
        return <HistorialCompras />;
      case 'incidencias':
        return <MisIncidencias />;
      default:
        return null;
    }
  };

  return (
    <>
      <UserLayout
        activeSection={activeTab}
        navigationItems={USER_NAVIGATION_ITEMS}
        onSectionChange={handleSectionChange}
        pageTitle={compraData ? 'Selección de asientos' : undefined}
        user={user}
      >
        {!compraData && (
          <section className="mb-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cinema-gold-500">
              Tu experiencia FilmStars
            </p>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {activeTab === 'cartelera' && 'Encuentra tu próxima película'}
              {activeTab === 'historial' && 'Tus compras y boletos'}
              {activeTab === 'incidencias' && 'Centro de ayuda'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'cartelera' && 'Elige dónde quieres ver cine y descubre las funciones disponibles.'}
              {activeTab === 'historial' && 'Consulta, filtra y descarga los boletos de tus compras.'}
              {activeTab === 'incidencias' && 'Envíanos una solicitud y consulta el estado de tus casos.'}
            </p>
          </section>
        )}
        {renderContent()}
      </UserLayout>

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
