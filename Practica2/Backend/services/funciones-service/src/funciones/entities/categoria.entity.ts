import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Pelicula } from './pelicula.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid', { name: 'id_categoria' })
  id: string;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @OneToMany(() => Pelicula, (pelicula) => pelicula.categoria)
  peliculas: Pelicula[];
}
