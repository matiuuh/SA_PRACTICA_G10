export type CarteleraCategoria = 'estreno' | 'preventa' | 'reestreno';

export interface HorarioFuncion {
  id: string;
  hora: string;
  fecha: string;
  precio: number;
  salaNombre: string;
  salaId: string;
  capacidadSala: number;
}

export interface CarteleraPelicula {
  id: string;
  titulo: string;
  sinopsis: string | null;
  genero: string;
  duracion: string;
  clasificacion: string;
  imagen: string;
  categoria: CarteleraCategoria;
  tipoCartelera: string;
  horarios: HorarioFuncion[];
}

export interface UserAsiento {
  id: string;
  numero: number;
  fila: string;
  estado:
    | 'libre'
    | 'seleccionado'
    | 'en_proceso'
    | 'por_validar'
    | 'validado'
    | 'ocupado';
}
