import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Pago } from './pago.entity';

@Entity({ name: 'estado_pago' })
export class EstadoPago {
  @PrimaryColumn({ name: 'id_estado', type: 'uuid' })
  id!: string;

  @Column({ unique: true })
  nombre!: string;

  @OneToMany(() => Pago, (pago) => pago.estado)
  pagos!: Pago[];
}
