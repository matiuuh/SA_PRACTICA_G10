import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Funcion } from './funcion.entity';

@Entity('salas')
export class Sala {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column()
  capacidad: number;

  @Column({ length: 50, default: '2D' })
  tipo: string;

  @Column()
  id_cine_externo: number;

  @OneToMany(() => Funcion, (funcion) => funcion.sala)
  funciones: Funcion[];
}
