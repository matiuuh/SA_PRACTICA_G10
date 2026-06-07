import { api, endpoints } from './api'
import type { Pelicula, CreatePeliculaDto, Categoria, TipoCartelera } from '../types/admin.types'

class PeliculasService {
  async getCategorias(): Promise<Categoria[]> {
    const response = await api.get(`${endpoints.categories}`)
    // Mapear el campo 'id' a 'id_categoria' para consistencia
    return response.data.map((item: any) => ({
      id_categoria: item.id,
      nombre: item.nombre
    }))
  }

  async getTiposCartelera(): Promise<TipoCartelera[]> {
    const response = await api.get(`${endpoints.tiposCartelera}`)
    // Mapear el campo 'id' a 'id_tipo_cartelera' para consistencia
    return response.data.map((item: any) => ({
      id_tipo_cartelera: item.id,
      nombre: item.nombre
    }))
  }

  async getPeliculas(): Promise<Pelicula[]> {
    const response = await api.get(`${endpoints.movies}`)
    return response.data
  }

  async createPelicula(data: CreatePeliculaDto): Promise<Pelicula> {
    const response = await api.post(`${endpoints.movies}`, data)
    return response.data
  }

  async updatePelicula(id: string, data: Partial<CreatePeliculaDto>): Promise<Pelicula> {
    const response = await api.put(`${endpoints.movies}/${id}`, data)
    return response.data
  }

  async deletePelicula(id: string): Promise<void> {
    await api.delete(`${endpoints.movies}/${id}`)
  }
}

export const peliculasService = new PeliculasService()
