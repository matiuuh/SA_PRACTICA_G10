import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Boleto } from './boleto.entity';
import { EstadoReserva } from './estado-reserva.entity';
import { ReservaDetalle } from './reserva-detalle.entity';

@Entity({ name: 'reservas' })
export class Reserva {
  @PrimaryColumn({ name: 'id_reserva', type: 'uuid' })
  id!: string;

  @Column({ name: 'usuario_id_externo', type: 'uuid' })
  usuarioIdExterno!: string;

  @Column({ name: 'fecha_reserva', type: 'timestamp' })
  fechaReserva!: Date;

  @Column({ name: 'fecha_expiracion', type: 'timestamp', nullable: true })
  fechaExpiracion?: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @ManyToOne(() => EstadoReserva, (estado) => estado.reservas, { eager: true })
  @JoinColumn({ name: 'id_estado' })
  estado!: EstadoReserva;

  @OneToMany(() => ReservaDetalle, (detalle) => detalle.reserva, {
    cascade: true,
  })
  detalles!: ReservaDetalle[];

  @OneToMany(() => Boleto, (boleto) => boleto.reserva)
  boletos!: Boleto[];
}
