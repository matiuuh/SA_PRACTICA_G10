import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Cine } from './cine.entity';

@Entity({ name: 'salas' })
export class Sala {
  @PrimaryColumn({ name: 'id_sala', type: 'uuid' })
  id: string;

  @Column()
  nombre: string;

  @Column()
  capacidad: number;

  @Column({ name: 'tipo_sala', nullable: true })
  tipoSala?: string | null;

  @ManyToOne(() => Cine, (cine) => cine.salas, { eager: true })
  @JoinColumn({ name: 'id_cine' })
  cine: Cine;
}
