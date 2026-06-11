import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Pelicula } from './pelicula.entity';

@Entity('tipo_cartelera')
export class TipoCartelera {
  @PrimaryGeneratedColumn('uuid', { name: 'id_tipo_cartelera' })
  id: string;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @OneToMany(() => Pelicula, (pelicula) => pelicula.tipoCartelera)
  peliculas: Pelicula[];
}
