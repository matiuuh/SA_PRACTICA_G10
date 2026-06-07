export type AdminTabType = 'peliculas' | 'funciones' | 'localidades' | 'salas'

export interface Categoria {
  id_categoria: string
  nombre: string
}

export interface TipoCartelera {
  id_tipo_cartelera: string
  nombre: string
}

export interface Pelicula {
  id_pelicula: string
  titulo: string
  sinopsis: string | null
  duracion_minutos: number | null
  poster_url: string | null
  activa: boolean
  categoria: Categoria
  tipoCartelera: TipoCartelera
}

export interface CreatePeliculaDto {
  titulo: string
  sinopsis?: string
  duracion_minutos?: number
  poster_url?: string
  id_categoria: string
  id_tipo_cartelera: string
  activa?: boolean
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
