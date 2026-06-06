import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Categoria } from './categoria.entity';
import { TipoCartelera } from './tipo-cartelera.entity';
import { Funcion } from './funcion.entity';

@Entity('peliculas')
export class Pelicula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  sinopsis: string;

  @Column({ nullable: true })
  duracion_minutos: number;

  @Column({ nullable: true, length: 500 })
  poster_url: string;

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
