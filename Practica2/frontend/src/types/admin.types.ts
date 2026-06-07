export type AdminTabType = 'peliculas' | 'funciones' | 'localidades' | 'salas'

export interface Pelicula {
  id: number
  titulo: string
  genero: string
  duracion: string
  clasificacion: string
  sinopsis: string
  categoria: 'estreno' | 'preventa' | 'reestreno'
  imagen: string
  fechaEstreno: string
}

export interface Localidad {
  id: number
  ciudad: string
  cine: string
  direccion: string
}

export interface Sala {
  id: number
  localidadId: number
  localidadNombre: string
  nombre: string
  capacidad: number
  tipo: 'normal' | 'premium' | 'vip'
}

export interface Funcion {
  id: number
  peliculaId: number
  peliculaNombre: string
  salaId: number
  salaNombre: string
  localidadNombre: string
  fecha: string
  horario: string
  precio: number
}
