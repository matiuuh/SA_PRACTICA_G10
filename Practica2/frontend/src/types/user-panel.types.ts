export type CarteleraCategoria = 'estreno' | 'preventa' | 'reestreno';

export interface HorarioFuncion {
  id: string;
  hora: string;
  fecha: string;
  precio: number;
  salaNombre: string;
}

export interface CarteleraPelicula {
  id: string;
  titulo: string;
  genero: string;
  duracion: string;
  clasificacion: string;
  imagen: string;
  categoria: CarteleraCategoria;
  horarios: HorarioFuncion[];
}
