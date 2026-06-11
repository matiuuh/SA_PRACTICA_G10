import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Pago } from './pago.entity';

@Entity({ name: 'metodos_pago' })
export class MetodoPago {
  @PrimaryColumn({ name: 'id_metodo', type: 'uuid' })
  id!: string;

  @Column({ unique: true })
  nombre!: string;

  @OneToMany(() => Pago, (pago) => pago.metodo)
  pagos!: Pago[];
}
