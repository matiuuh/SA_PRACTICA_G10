export interface Categoria {
  id: string;
  nombre: string;
}

export interface TipoCartelera {
  id: string;
  nombre: string;
}

export interface Pelicula {
  id: string;
  titulo: string;
  sinopsis: string | null;
  duracion_minutos: number | null;
  poster_url: string | null;
  activa: boolean;
  categoria: Categoria;
  tipoCartelera: TipoCartelera;
}

export interface SalaFuncion {
  id: string;
  nombre: string;
  capacidad: number;
  tipo: string;
  id_cine_externo: string;
}

export interface Funcion {
  id: string;
  fecha: string;
  hora: string;
  precio: number;
  activa: boolean;
  pelicula: Pelicula;
  sala: SalaFuncion;
}

export interface CreatePeliculaRequest {
  titulo: string;
  sinopsis?: string;
  duracion_minutos?: number;
  poster_url?: string;
  id_categoria: string;
  id_tipo_cartelera: string;
  activa?: boolean;
}

export interface UpdatePeliculaRequest {
  titulo?: string;
  sinopsis?: string;
  duracion_minutos?: number;
  poster_url?: string;
  id_categoria?: string;
  id_tipo_cartelera?: string;
  activa?: boolean;
}

export interface CreateFuncionRequest {
  fecha: string;
  hora: string;
  precio: number;
  id_pelicula: string;
  id_sala: string;
  activa?: boolean;
}

export interface UpdateFuncionRequest {
  fecha?: string;
  hora?: string;
  precio?: number;
  id_pelicula?: string;
  id_sala?: string;
  activa?: boolean;
}

export interface CreateSalaFuncionRequest {
  nombre: string;
  capacidad: number;
  tipo?: string;
  id_cine_externo: string;
}

export interface FuncionesFilter {
  sala?: string;
  pelicula?: string;
  cine?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedFunciones {
  data: Funcion[];
  meta: PaginationMeta;
}

export interface PaginatedSalas {
  data: SalaFuncion[];
  meta: PaginationMeta;
}
