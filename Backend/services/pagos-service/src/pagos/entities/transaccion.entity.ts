import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Pago } from './pago.entity';

@Entity({ name: 'transacciones' })
export class Transaccion {
  @PrimaryColumn({ name: 'id_transaccion', type: 'uuid' })
  id!: string;

  @Column({ unique: true })
  referencia!: string;

  @Column({ type: 'varchar', nullable: true })
  autorizacion?: string | null;

  @Column({ name: 'fecha_transaccion', type: 'timestamp' })
  fechaTransaccion!: Date;

  @ManyToOne(() => Pago, (pago) => pago.transacciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pago' })
  pago!: Pago;
}
