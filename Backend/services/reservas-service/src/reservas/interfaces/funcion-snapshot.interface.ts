export interface FuncionSnapshot {
  funcionId: string;
  peliculaId: string;
  peliculaTitulo: string;
  fechaFuncion: string;
  horaFuncion: string;
  salaNombre: string;
}

export interface FuncionCatalogClient {
  findSnapshotById(funcionId: string): Promise<FuncionSnapshot | null>;
}

export const FUNCION_CATALOG_CLIENT = Symbol('FUNCION_CATALOG_CLIENT');
