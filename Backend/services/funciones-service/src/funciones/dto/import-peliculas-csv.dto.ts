export interface PeliculasCsvImportError {
  fila: number;
  error: string;
}

export interface PeliculasCsvImportResult {
  insertadas: number;
  fallidas: number;
  errores: PeliculasCsvImportError[];
}

export interface CsvPeliculaRow {
  titulo: string;
  sinopsis?: string;
  duracion_minutos?: string;
  poster_url?: string;
  categoria?: string;
  tipo_cartelera?: string;
  id_categoria?: string;
  id_tipo_cartelera?: string;
  activa?: string;
}
