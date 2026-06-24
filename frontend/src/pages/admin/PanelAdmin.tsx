// src/pages/PanelAdmin/PanelAdmin.tsx

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaCity,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaFilm,
  FaRedo,
  FaTheaterMasks,
} from 'react-icons/fa';
import AdminLayout from '../../components/templates/AdminLayout/AdminLayout';
import AdminPeliculas from '../../components/organisms/AdminPeliculas/AdminPeliculas';
import AdminLocalidades from '../../components/organisms/AdminLocalidades/AdminLocalidades';
import AdminFunciones from '../../components/organisms/AdminFunciones/AdminFunciones';
import AdminSalas from '../../components/organisms/AdminSalas/AdminSalas';
import AdminIncidencias from '../../components/organisms/AdminIncidencias/AdminIncidencias';
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

type AdminToast = {
  message: string;
  type: 'success' | 'error';
};

const ADMIN_NAVIGATION_ITEMS = [
  { id: 'peliculas' as AdminTabType, label: 'Películas', description: 'Catálogo y estrenos', icon: FaFilm },
  { id: 'localidades' as AdminTabType, label: 'Cines', description: 'Sedes y ubicaciones', icon: FaCity },
  { id: 'salas' as AdminTabType, label: 'Salas', description: 'Espacios y capacidad', icon: FaTheaterMasks },
  { id: 'funciones' as AdminTabType, label: 'Funciones', description: 'Horarios y precios', icon: FaCalendarAlt },
  { id: 'incidencias' as AdminTabType, label: 'Incidencias', description: 'Soporte al cliente', icon: FaExclamationCircle },
];

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
  const [toast, setToast] = useState<AdminToast | null>(null);

  const showAdminToast = (message: string, type: AdminToast['type'] = 'success') => {
    setToast(null);
    window.setTimeout(() => setToast({ message, type }), 0);
  };

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
        peliculasService.getAllPeliculas(),
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

  const handleImportarPeliculas = useCallback(async () => {
    const peliculasData = await peliculasService.getAllPeliculas();
    setPeliculas(peliculasData);
  }, []);

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
      showAdminToast('Sala creada exitosamente');
    } catch (err) {
      console.error('Error creando sala:', err);
      const message = extractErrorMessage(err, 'No se pudo crear la sala.');
      setError(message);
      showAdminToast(message, 'error');
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
      showAdminToast('Sala actualizada exitosamente');
    } catch (err) {
      console.error('Error actualizando sala:', err);
      const message = extractErrorMessage(err, 'No se pudo actualizar la sala.');
      setError(message);
      showAdminToast(message, 'error');
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
      showAdminToast('Sala eliminada exitosamente');
    } catch (err) {
      console.error('Error eliminando sala:', err);
      const message = extractErrorMessage(err, 'No se pudo eliminar la sala.');
      setError(message);
      showAdminToast(message, 'error');
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
      showAdminToast('Funcion creada exitosamente');
    } catch (err) {
      console.error('Error creando funcion:', err);
      const message = extractErrorMessage(err, 'No se pudo crear la funcion.');
      setError(message);
      showAdminToast(message, 'error');
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
      showAdminToast('Funcion actualizada exitosamente');
    } catch (err) {
      console.error('Error actualizando funcion:', err);
      const message = extractErrorMessage(err, 'No se pudo actualizar la funcion.');
      setError(message);
      showAdminToast(message, 'error');
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  const handleEliminarFuncion = async (id: string) => {
    setSavingSection('funciones');
    setError(null);

    try {
      await funcionesService.deleteFuncion(id);
      await cargarDatos();
      showAdminToast('Funcion eliminada exitosamente');
    } catch (err) {
      console.error('Error eliminando función:', err);
      const message = extractErrorMessage(err, 'No se pudo eliminar la funcion.');
      setError(message);
      showAdminToast(message, 'error');
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        activeSection={activeTab}
        navigationItems={ADMIN_NAVIGATION_ITEMS}
        onSectionChange={setActiveTab}
        user={user}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cinema-red-500" />
            <p className="font-semibold text-gray-200">Preparando tu panel</p>
            <p className="mt-1 text-sm text-gray-500">Cargando la información administrativa...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      activeSection={activeTab}
      navigationItems={ADMIN_NAVIGATION_ITEMS}
      onSectionChange={setActiveTab}
      user={user}
    >
      <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cinema-gold-500">
            Centro de operaciones
          </p>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Panel de administración</h2>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenido, {user?.nombre || 'Administrador'}. Gestiona la operación de FilmStars desde un solo lugar.
          </p>
        </div>
      </section>

      {error && (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-cinema-red-500/25 bg-cinema-red-500/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="mt-0.5 shrink-0 text-cinema-red-500" />
            <div>
              <p className="text-sm font-semibold text-white">No pudimos completar la última operación</p>
              <p className="mt-0.5 text-sm text-gray-400">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void cargarDatos()}
            className="flex w-fit shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/[0.06]"
          >
            <FaRedo />
            Reintentar
          </button>
        </div>
      )}

      <div className="min-w-0">
        {activeTab === 'peliculas' && (
          <AdminPeliculas
            peliculas={peliculas}
            onAgregar={handleAgregarPelicula}
            onEditar={handleEditarPelicula}
            onEliminar={handleEliminarPelicula}
            onImportar={handleImportarPeliculas}
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
            onEliminar={handleEliminarFuncion}
          />
        )}

        {activeTab === 'incidencias' && (
          <AdminIncidencias />
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
};

export default PanelAdmin;
