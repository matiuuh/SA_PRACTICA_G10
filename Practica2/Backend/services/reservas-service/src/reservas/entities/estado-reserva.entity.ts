import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Reserva } from './reserva.entity';

@Entity({ name: 'estado_reserva' })
export class EstadoReserva {
  @PrimaryColumn({ name: 'id_estado', type: 'uuid' })
  id!: string;

  @Column({ unique: true })
  nombre!: string;

  @OneToMany(() => Reserva, (reserva) => reserva.estado)
  reservas!: Reserva[];
}
