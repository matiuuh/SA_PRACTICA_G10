export interface Ciudad {
  id: string;
  nombre: string;
}

export interface Cine {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: Ciudad;
}

export interface Sala {
  id: string;
  nombre: string;
  capacidad: number;
  tipoSala: string | null;
  cine: Cine;
}

export interface CreateCiudadRequest {
  nombre: string;
}

export interface CreateCineRequest {
  nombre: string;
  direccion: string;
  idCiudad: string;
}

export interface CreateSalaRequest {
  nombre: string;
  capacidad: number;
  idCine: string;
  tipoSala?: string;
}

export interface UpdateCineRequest {
  nombre?: string;
  direccion?: string;
  idCiudad?: string;
}

export interface CreateLocalidadForm {
  ciudad: string;
  cine: string;
  direccion: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCines {
  data: Cine[];
  meta: PaginationMeta;
}
