import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pelicula } from './pelicula.entity';
import { Sala } from './sala.entity';

@Entity('funciones')
export class Funcion {
  @PrimaryGeneratedColumn('uuid', { name: 'id_funcion' })
  id: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  hora: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ default: true })
  activa: boolean;

  @ManyToOne(() => Pelicula, (pelicula) => pelicula.funciones, { eager: true })
  @JoinColumn({ name: 'id_pelicula' })
  pelicula: Pelicula;

  @ManyToOne(() => Sala, (sala) => sala.funciones, { eager: true })
  @JoinColumn({ name: 'id_sala' })
  sala: Sala;
}
