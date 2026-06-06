import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Ciudad } from './ciudad.entity';
import { Sala } from './sala.entity';

@Entity({ name: 'cines' })
export class Cine {
  @PrimaryColumn({ name: 'id_cine', type: 'uuid' })
  id: string;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @ManyToOne(() => Ciudad, (ciudad) => ciudad.cines, { eager: true })
  @JoinColumn({ name: 'id_ciudad' })
  ciudad: Ciudad;

  @OneToMany(() => Sala, (sala) => sala.cine)
  salas: Sala[];
}
