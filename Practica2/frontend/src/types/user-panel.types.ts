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
  genero: string;
  duracion: string;
  clasificacion: string;
  imagen: string;
  categoria: CarteleraCategoria;
  horarios: HorarioFuncion[];
}

export interface UserAsiento {
  id: string;
  numero: number;
  fila: string;
  estado: 'disponible' | 'seleccionado' | 'ocupado';
}
