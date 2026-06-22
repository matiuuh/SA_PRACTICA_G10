// src/types/admin.types.ts

export type AdminTabType = 'peliculas' | 'funciones' | 'localidades' | 'salas' | 'validacion' | 'incidencias';

export interface Categoria {
  id_categoria: string;
  nombre: string;
}

export interface TipoCartelera {
  id_tipo_cartelera: string;
  nombre: string;
}

export interface Pelicula {
  id_pelicula: string;
  titulo: string;
  sinopsis: string | null;
  duracion_minutos: number | null;
  poster_url: string | null;
  activa: boolean;
  categoria: Categoria;
  tipoCartelera: TipoCartelera;
}

export interface CreatePeliculaDto {
  titulo: string;
  sinopsis?: string;
  duracion_minutos?: number;
  poster_url?: string;
  id_categoria: string;
  id_tipo_cartelera: string;
  activa?: boolean;
}

export interface PeliculasPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPeliculas {
  data: Pelicula[];
  meta: PeliculasPaginationMeta;
}

export interface PeliculasQuery {
  page?: number;
  limit?: number;
  search?: string;
  id_categoria?: string;
  id_tipo_cartelera?: string;
  tipo_cartelera?: string;
  activa?: boolean;
}

export interface PeliculasCsvImportResult {
  insertadas: number;
  fallidas: number;
  errores: Array<{
    fila: number;
    error: string;
  }>;
}

// Tipos para localidades/ciudades/cines (desde el backend)
export interface CiudadBackend {
  id: string;
  nombre: string;
}

export interface CineBackend {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: CiudadBackend;
}

export interface Localidad {
  id: string;
  ciudadId: string;
  ciudad: string;
  cine: string;
  direccion: string;
}

export interface CreateLocalidadForm {
  ciudad: string;
  cine: string;
  direccion: string;
}

// Request/Response para el CRUD de cines
export interface CreateCineRequest {
  nombre: string;
  direccion: string;
  idCiudad: string;
}

export interface UpdateCineRequest {
  nombre?: string;
  direccion?: string;
  idCiudad?: string;
}

export interface Sala {
  id: string;
  cineId: string;
  localidadNombre: string;
  ciudad: string;
  nombre: string;
  capacidad: number;
  tipo: string;
}

export interface CreateSalaForm {
  cineId: string;
  nombre: string;
  capacidad: number;
  tipo: string;
}

export interface Funcion {
  id: string;
  peliculaId: string;
  peliculaNombre: string;
  salaId: string;
  salaNombre: string;
  localidadNombre: string;
  fecha: string;
  horario: string;
  precio: number;
  activa: boolean;
}

export interface CreateFuncionForm {
  peliculaId: string;
  salaId: string;
  fecha: string;
  horario: string;
  precio: number;
  activa: boolean;
}

// ========== TIPOS PARA VALIDACIÓN DE BOLETOS ==========

export interface BoletoValidacion {
  id: string;
  codigoQr: string;
  estado: 'VALIDO' | 'USADO';
  fechaEmision: string;
  fechaUso: string | null;
  validadoPor: string | null;
  reserva: {
    id: string;
    usuarioId: string;
    fechaReserva: string;
    total: number;
  };
  funcion: {
    id: string | null;
    fecha: string | null;
    hora: string | null;
    sala: string | null;
  };
  pelicula: {
    id: string | null;
    titulo: string | null;
  };
  asientos: Array<{
    id: string;
    fila: string;
    numero: number;
  }>;
}

export interface BoletoValidacionResultado {
  success: boolean;
  message: string;
  boleto?: BoletoValidacion;
  error?: string;
}

export interface AdminBusquedaBoletosFiltros {
  identificador?: string;
  pelicula?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'VALIDO' | 'USADO';
  page?: number;
  limit?: number;
}

export interface AdminBusquedaBoletosResultado {
  data: BoletoValidacion[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
