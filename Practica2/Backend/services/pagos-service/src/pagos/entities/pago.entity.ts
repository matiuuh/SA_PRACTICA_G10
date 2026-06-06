import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { EstadoPago } from './estado-pago.entity';
import { MetodoPago } from './metodo-pago.entity';
import { Transaccion } from './transaccion.entity';

@Entity({ name: 'pagos' })
export class Pago {
  @PrimaryColumn({ name: 'id_pago', type: 'uuid' })
  id!: string;

  @Column({ name: 'reserva_id_externa', type: 'uuid' })
  reservaIdExterna!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({ name: 'fecha_pago', type: 'timestamp' })
  fechaPago!: Date;

  @ManyToOne(() => MetodoPago, (metodo) => metodo.pagos, { eager: true })
  @JoinColumn({ name: 'id_metodo' })
  metodo!: MetodoPago;

  @ManyToOne(() => EstadoPago, (estado) => estado.pagos, { eager: true })
  @JoinColumn({ name: 'id_estado' })
  estado!: EstadoPago;

  @OneToMany(() => Transaccion, (transaccion) => transaccion.pago, {
    cascade: true,
  })
  transacciones!: Transaccion[];
}
