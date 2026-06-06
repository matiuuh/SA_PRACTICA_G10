import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Reserva } from './reserva.entity';

@Entity({ name: 'boletos' })
export class Boleto {
  @PrimaryColumn({ name: 'id_boleto', type: 'uuid' })
  id!: string;

  @Column({ name: 'codigo_qr' })
  codigoQr!: string;

  @Column({ name: 'fecha_emision', type: 'timestamp' })
  fechaEmision!: Date;

  @ManyToOne(() => Reserva, (reserva) => reserva.boletos, { eager: true })
  @JoinColumn({ name: 'id_reserva' })
  reserva!: Reserva;
}
