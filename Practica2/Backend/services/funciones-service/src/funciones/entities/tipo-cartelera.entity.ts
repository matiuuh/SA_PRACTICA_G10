import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pelicula } from './pelicula.entity';

@Entity('tipo_cartelera')
export class TipoCartelera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @OneToMany(() => Pelicula, (pelicula) => pelicula.tipoCartelera)
  peliculas: Pelicula[];
}
