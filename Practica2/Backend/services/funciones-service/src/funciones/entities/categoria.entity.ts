import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pelicula } from './pelicula.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @OneToMany(() => Pelicula, (pelicula) => pelicula.categoria)
  peliculas: Pelicula[];
}
