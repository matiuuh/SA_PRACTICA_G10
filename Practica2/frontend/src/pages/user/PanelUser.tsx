import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/templates/MainLayout/MainLayout';
import UserProfileHeader from '../../components/organisms/UserProfileHeader/UserProfileHeader';
import UserSubHeader from '../../components/organisms/UserSubHeader/UserSubHeader';
import Cartelera from '../../components/organisms/Cartelera/Cartelera';
import SeleccionAsientos from '../../components/organisms/SeleccionAsientos/SeleccionAsientos';
import MiPerfil from '../../components/organisms/MiPerfil/MiPerfil';
import ModalHorarios from '../../components/organisms/ModalHorarios/ModalHorarios';
import ModalPago from '../../components/organisms/ModalPago/ModalPago';
import ModalConfirmacion from '../../components/organisms/ModalConfirmacion/ModalConfirmacion';
import { authService } from '../../services/auth.service';
import { funcionesService } from '../../services/funciones.service';
import { type TabType } from '../../types/panel.types';
import type { Funcion } from '../../types/funciones.types';
import type { CarteleraCategoria, CarteleraPelicula, HorarioFuncion } from '../../types/user-panel.types';

const CITY_STORAGE_KEY = 'selectedCity';
const CINEMA_STORAGE_KEY = 'selectedCinema';
const SELECTION_EVENT = 'filmstars-selection-changed';

interface Asiento {
  id: string;
  numero: number;
  fila: string;
  estado: 'disponible' | 'seleccionado' | 'ocupado';
}

interface BoletaGenerada {
  id: string;
  pelicula: string;
  horario: string;
  fecha: string;
  asientos: string[];
  total: number;
  fechaCompra: string;
  metodoPago: string;
  ultimosDigitos: string;
}

const normalizeCategoria = (nombre?: string | null): CarteleraCategoria => {
  const value = (nombre || '').trim().toLowerCase();

  if (value.includes('pre')) {
    return 'preventa';
  }

  if (value.includes('re')) {
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
    };

    if (!existing) {
      grouped.set(peliculaId, {
        id: peliculaId,
        titulo: funcion.pelicula.titulo,
        genero: funcion.pelicula.categoria?.nombre || 'Cartelera general',
        duracion: formatDuration(funcion.pelicula.duracion_minutos),
        clasificacion: funcion.sala.tipo || 'General',
        imagen: funcion.pelicula.poster_url || '',
        categoria,
        horarios: [horario],
      });
      return;
    }

    existing.horarios.push(horario);
  });

  return Array.from(grouped.values())
    .map((pelicula) => ({
      ...pelicula,
      horarios: [...pelicula.horarios].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)),
    }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo));
};

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
  const [carteleraLoading, setCarteleraLoading] = useState(false);
  const [carteleraError, setCarteleraError] = useState<string | null>(null);
  const [selectedPelicula, setSelectedPelicula] = useState<CarteleraPelicula | null>(null);
  const [compraData, setCompraData] = useState<{
    pelicula: CarteleraPelicula;
    funcion: HorarioFuncion;
  } | null>(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<Asiento[]>([]);
  const [totalPago, setTotalPago] = useState(0);
  const [boletaGenerada, setBoletaGenerada] = useState<BoletaGenerada | null>(null);

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
    if (!selectedCinema) {
      setPeliculas([]);
      setCarteleraError(null);
      return;
    }

    const loadCartelera = async () => {
      setCarteleraLoading(true);
      setCarteleraError(null);

      try {
        const funciones = await funcionesService.getFunciones({ cine: selectedCinema });
        setPeliculas(mapFuncionesToCartelera(funciones));
      } catch (error) {
        console.error('No se pudo cargar la cartelera del cine seleccionado', error);
        setPeliculas([]);
        setCarteleraError('No se pudo cargar la cartelera en este momento.');
      } finally {
        setCarteleraLoading(false);
      }
    };

    void loadCartelera();
  }, [selectedCinema]);

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

  const handleConfirmarSeleccionAsientos = (asientos: Asiento[], total: number) => {
    setAsientosSeleccionados(asientos);
    setTotalPago(total);
    setModalPagoOpen(true);
  };

  const handlePagar = (datosPago: { numeroTarjeta: string }) => {
    const boleta = {
      id: `BOL-${Date.now()}`,
      pelicula: compraData?.pelicula.titulo || '',
      horario: compraData?.funcion.hora || '',
      fecha: compraData?.funcion.fecha || '',
      asientos: asientosSeleccionados.map((asiento) => asiento.id),
      total: totalPago,
      fechaCompra: new Date().toLocaleString(),
      metodoPago: 'Tarjeta de credito',
      ultimosDigitos: datosPago.numeroTarjeta.slice(-4),
    };

    setBoletaGenerada(boleta);
    setModalPagoOpen(false);
    setModalConfirmacionOpen(true);
  };

  const handleCerrarConfirmacion = () => {
    setModalConfirmacionOpen(false);
    setCompraData(null);
    setAsientosSeleccionados([]);
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
        onVerHorarios={handleVerHorarios}
        selectedCity={selectedCity}
        selectedCinema={selectedCinema}
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
              }}
              onConfirmarSeleccion={handleConfirmarSeleccionAsientos}
            />
          );
        }

        return (
          <div className="cinema-card p-6 text-center">
            <p className="text-gray-400">Primero selecciona una pelicula y un horario desde la cartelera.</p>
            <button
              onClick={() => setActiveTab('cartelera')}
              className="mt-4 bg-cinema-red-500 text-white px-4 py-2 rounded-lg"
            >
              Ir a Cartelera
            </button>
          </div>
        );
      case 'mi-perfil':
        return <MiPerfil usuario={{ nombre: user?.nombre || '', correo: user?.correo || '', telefono: '' }} />;
      default:
        return null;
    }
  };

  return (
    <>
      <MainLayout>
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
        asientos={asientosSeleccionados.map((asiento) => asiento.id)}
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
    </>
  );
};

export default PanelUser;
