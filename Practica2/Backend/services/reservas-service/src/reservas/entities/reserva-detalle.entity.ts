import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Asiento } from './asiento.entity';
import { Reserva } from './reserva.entity';

@Entity({ name: 'reserva_detalle' })
export class ReservaDetalle {
  @PrimaryColumn({ name: 'id_detalle', type: 'uuid' })
  id!: string;

  @ManyToOne(() => Reserva, (reserva) => reserva.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_reserva' })
  reserva!: Reserva;

  @ManyToOne(() => Asiento, (asiento) => asiento.detalles, { eager: true })
  @JoinColumn({ name: 'id_asiento' })
  asiento!: Asiento;
}
