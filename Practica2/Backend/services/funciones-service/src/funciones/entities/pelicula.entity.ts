import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categoria } from './categoria.entity';
import { Funcion } from './funcion.entity';
import { TipoCartelera } from './tipo-cartelera.entity';

@Entity('peliculas')
export class Pelicula {
  @PrimaryGeneratedColumn('uuid', { name: 'id_pelicula' })
  id: string;

  @Column({ length: 255 })
  titulo: string;

  @Column({ name: 'sinopsis', type: 'text', nullable: true })
  sinopsis: string | null;

  @Column({ name: 'duracion_minutos', type: 'integer', nullable: true })
  duracion_minutos: number | null;

  @Column({ name: 'poster_url', type: 'varchar', nullable: true, length: 500 })
  poster_url: string | null;

  @Column({ default: true })
  activa: boolean;

  @ManyToOne(() => Categoria, (categoria) => categoria.peliculas, { eager: true })
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @ManyToOne(() => TipoCartelera, (tipo) => tipo.peliculas, { eager: true })
  @JoinColumn({ name: 'id_tipo_cartelera' })
  tipoCartelera: TipoCartelera;

  @OneToMany(() => Funcion, (funcion) => funcion.pelicula)
  funciones: Funcion[];
}
