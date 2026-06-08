import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Funcion } from './funcion.entity';

@Entity('salas')
export class Sala {
  @PrimaryGeneratedColumn('uuid', { name: 'id_sala' })
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column()
  capacidad: number;

  @Column({ length: 50, default: '2D' })
  tipo: string;

  @Column({ type: 'uuid' })
  id_cine_externo: string;

  @OneToMany(() => Funcion, (funcion) => funcion.sala)
  funciones: Funcion[];
}
