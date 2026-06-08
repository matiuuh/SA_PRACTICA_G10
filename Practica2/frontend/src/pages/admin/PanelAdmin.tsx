import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaCity, FaFilm, FaTheaterMasks } from 'react-icons/fa';
import MainLayout from '../../components/templates/MainLayout/MainLayout';
import AdminPeliculas from '../../components/organisms/AdminPeliculas/AdminPeliculas';
import AdminLocalidades from '../../components/organisms/AdminLocalidades/AdminLocalidades';
import AdminFunciones from '../../components/organisms/AdminFunciones/AdminFunciones';
import AdminSalas from '../../components/organisms/AdminSalas/AdminSalas';
import Toast from '../../components/atoms/Toast/Toast';
import { authService } from '../../services/auth.service';
import { peliculasService } from '../../services/peliculas.service';
import { localidadesService } from '../../services/localidades.service';
import { funcionesService } from '../../services/funciones.service';
import type {
  AdminTabType,
  CreateFuncionForm,
  CreateLocalidadForm,
  CreateSalaForm,
  Funcion,
  Localidad,
  Pelicula,
  Sala,
} from '../../types/admin.types';
import type { Funcion as FuncionApi, SalaFuncion } from '../../types/funciones.types';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
};

const normalizeHora = (hora: string) => (hora.length === 5 ? `${hora}:00` : hora);

const PanelAdmin = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [activeTab, setActiveTab] = useState<AdminTabType>('peliculas');
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<AdminTabType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mapSalas = useCallback((salasData: SalaFuncion[], localidadesData: Localidad[]): Sala[] => {
    const localidadesMap = new Map(localidadesData.map((localidad) => [localidad.id, localidad]));

    return salasData.map((sala) => {
      const localidad = localidadesMap.get(sala.id_cine_externo);

      return {
        id: sala.id,
        cineId: sala.id_cine_externo,
        localidadNombre: localidad?.cine || 'Cine no encontrado',
        ciudad: localidad?.ciudad || 'Sin ciudad',
        nombre: sala.nombre,
        capacidad: sala.capacidad,
        tipo: sala.tipo || 'General',
      };
    });
  }, []);

  const mapFunciones = useCallback((funcionesData: FuncionApi[], salasData: Sala[]): Funcion[] => {
    const salasMap = new Map(salasData.map((sala) => [sala.id, sala]));

    return funcionesData.map((funcion) => {
      const sala = salasMap.get(funcion.sala.id);

      return {
        id: funcion.id,
        peliculaId: funcion.pelicula.id,
        peliculaNombre: funcion.pelicula.titulo,
        salaId: funcion.sala.id,
        salaNombre: funcion.sala.nombre,
        localidadNombre: sala?.localidadNombre || 'Cine no encontrado',
        fecha: funcion.fecha,
        horario: funcion.hora,
        precio: funcion.precio,
        activa: funcion.activa,
      };
    });
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [peliculasData, ciudadesData, salasFuncionesData, funcionesData] = await Promise.all([
        peliculasService.getPeliculas(),
        localidadesService.getCiudades(),
        funcionesService.getSalas(),
        funcionesService.getFunciones(),
      ]);

      const cinesPorCiudad = await Promise.all(
        ciudadesData.map(async (ciudad) => {
          const cines = await localidadesService.getCinesByCiudad(ciudad.id);
          return cines.map((cine) => ({
            id: cine.id,
            ciudadId: ciudad.id,
            ciudad: ciudad.nombre,
            cine: cine.nombre,
            direccion: cine.direccion,
          }));
        }),
      );

      const localidadesData = cinesPorCiudad.flat();
      const salasData = mapSalas(salasFuncionesData, localidadesData);

      setPeliculas(peliculasData);
      setLocalidades(localidadesData);
      setSalas(salasData);
      setFunciones(mapFunciones(funcionesData, salasData));
    } catch (err) {
      console.error('Error cargando datos del panel admin:', err);
      setError(extractErrorMessage(err, 'No se pudieron cargar los datos del panel de administracion.'));
    } finally {
      setLoading(false);
    }
  }, [mapFunciones, mapSalas]);

  useEffect(() => {
    document.title = 'Panel de Administracion | FilmStars';

    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (user?.rol !== 'ADMINISTRADOR') {
      navigate('/panel/usuario');
      return;
    }

    void cargarDatos();
  }, [cargarDatos, navigate, user?.rol]);

  const handleAgregarPelicula = (pelicula: Pelicula) => {
    setPeliculas((prev) => [...prev, pelicula]);
  };

  const handleEditarPelicula = (pelicula: Pelicula) => {
    setPeliculas((prev) => prev.map((item) => (item.id_pelicula === pelicula.id_pelicula ? pelicula : item)));
  };

  const handleEliminarPelicula = (id: string) => {
    setPeliculas((prev) => prev.filter((pelicula) => pelicula.id_pelicula !== id));
  };

  const handleAgregarLocalidad = async (localidad: CreateLocalidadForm) => {
    setSavingSection('localidades');
    setError(null);

    try {
      const ciudades = await localidadesService.getCiudades();
      const ciudadExistente = ciudades.find(
        (ciudad) => ciudad.nombre.trim().toLowerCase() === localidad.ciudad.trim().toLowerCase(),
      );

      const ciudad = ciudadExistente || (await localidadesService.createCiudad({ nombre: localidad.ciudad.trim() }));

      await localidadesService.createCine({
        nombre: localidad.cine.trim(),
        direccion: localidad.direccion.trim(),
        idCiudad: ciudad.id,
      });

      await cargarDatos();
    } catch (err) {
      console.error('Error creando cine:', err);
      setError(extractErrorMessage(err, 'No se pudo crear el cine.'));
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  const handleAgregarSala = async (sala: CreateSalaForm) => {
    setSavingSection('salas');
    setError(null);

    try {
      await funcionesService.createSala({
        nombre: sala.nombre.trim(),
        capacidad: sala.capacidad,
        tipo: sala.tipo.trim(),
        id_cine_externo: sala.cineId,
      });

      await cargarDatos();
    } catch (err) {
      console.error('Error creando sala:', err);
      setError(extractErrorMessage(err, 'No se pudo crear la sala.'));
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  const handleEditarSala = async (sala: Sala) => {
    setSavingSection('salas');
    setError(null);

    try {
      await funcionesService.updateSala(sala.id, {
        nombre: sala.nombre.trim(),
        capacidad: sala.capacidad,
        tipo: sala.tipo.trim(),
        id_cine_externo: sala.cineId,
      });

      await cargarDatos();
    } catch (err) {
      console.error('Error actualizando sala:', err);
      setError(extractErrorMessage(err, 'No se pudo actualizar la sala.'));
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  const handleEliminarSala = async (id: string) => {
    setSavingSection('salas');
    setError(null);

    try {
      await funcionesService.deleteSala(id);
      await cargarDatos();
    } catch (err) {
      console.error('Error eliminando sala:', err);
      setError(extractErrorMessage(err, 'No se pudo eliminar la sala.'));
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  const handleAgregarFuncion = async (funcion: CreateFuncionForm) => {
    setSavingSection('funciones');
    setError(null);

    try {
      await funcionesService.createFuncion({
        fecha: funcion.fecha,
        hora: normalizeHora(funcion.horario),
        precio: funcion.precio,
        id_pelicula: funcion.peliculaId,
        id_sala: funcion.salaId,
        activa: funcion.activa,
      });

      await cargarDatos();
    } catch (err) {
      console.error('Error creando funcion:', err);
      setError(extractErrorMessage(err, 'No se pudo crear la funcion.'));
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  const handleEditarFuncion = async (funcion: Funcion) => {
    setSavingSection('funciones');
    setError(null);

    try {
      await funcionesService.updateFuncion(funcion.id, {
        fecha: funcion.fecha,
        hora: normalizeHora(funcion.horario),
        precio: funcion.precio,
        id_pelicula: funcion.peliculaId,
        id_sala: funcion.salaId,
        activa: funcion.activa,
      });

      await cargarDatos();
    } catch (err) {
      console.error('Error actualizando funcion:', err);
      setError(extractErrorMessage(err, 'No se pudo actualizar la funcion.'));
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  const tabs = [
    { id: 'peliculas' as AdminTabType, label: 'Peliculas', icon: FaFilm },
    { id: 'localidades' as AdminTabType, label: 'Cines', icon: FaCity },
    { id: 'salas' as AdminTabType, label: 'Salas', icon: FaTheaterMasks },
    { id: 'funciones' as AdminTabType, label: 'Funciones', icon: FaCalendarAlt },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">Cargando panel de administracion...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de administracion</h1>
          <p className="text-gray-400">Bienvenido, {user?.nombre || 'Administrador'}</p>
          {error && <p className="text-cinema-red-500 mt-2">{error}</p>}
        </div>

        <div className="cinema-card p-1 mb-8 flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                  isActive
                    ? 'bg-cinema-red-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-cinema-dark-800'
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido */}
        {activeTab === 'peliculas' && (
          <AdminPeliculas
            peliculas={peliculas}
            onAgregar={handleAgregarPelicula}
            onEditar={handleEditarPelicula}
            onEliminar={handleEliminarPelicula}
          />
        )}

        {activeTab === 'localidades' && (
          <AdminLocalidades
            localidades={localidades}
            isSaving={savingSection === 'localidades'}
            onAgregar={handleAgregarLocalidad}
          />
        )}

        {activeTab === 'salas' && (
          <AdminSalas
            salas={salas}
            localidades={localidades}
            isSaving={savingSection === 'salas'}
            onAgregar={handleAgregarSala}
            onEditar={handleEditarSala}
            onEliminar={handleEliminarSala}
          />
        )}

        {activeTab === 'funciones' && (
          <AdminFunciones
            funciones={funciones}
            peliculas={peliculas}
            salas={salas}
            isSaving={savingSection === 'funciones'}
            onAgregar={handleAgregarFuncion}
            onEditar={handleEditarFuncion}
          />
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />}
    </MainLayout>
  );
};

export default PanelAdmin;
