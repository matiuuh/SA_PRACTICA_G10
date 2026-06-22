export type TipoIncidencia = 'PROBLEMA' | 'SUGERENCIA' | 'OTRO';
export type EstadoIncidencia = 'PENDIENTE' | 'RESPONDIDA';

export interface Incidencia {
  id: string;
  usuarioIdExterno: string;
  tipo: TipoIncidencia;
  asunto: string;
  descripcion: string;
  estado: EstadoIncidencia;
  respuesta: string | null;
  administradorIdExterno: string | null;
  fechaCreacion: string;
  fechaRespuesta: string | null;
}

export interface PaginatedIncidencias {
  data: Incidencia[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateIncidenciaPayload {
  tipo: TipoIncidencia;
  asunto: string;
  descripcion: string;
}
