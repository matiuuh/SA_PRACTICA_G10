import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Reserva } from './reserva.entity';
import { EstadoBoleto } from '../enums/estado-boleto.enum';

@Entity({ name: 'boletos' })
export class Boleto {
  @PrimaryColumn({ name: 'id_boleto', type: 'uuid' })
  id!: string;

  @Column({ name: 'codigo_qr', unique: true })
  codigoQr!: string;

  @Column({ name: 'fecha_emision', type: 'timestamp' })
  fechaEmision!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoBoleto.VALIDO,
  })
  estado!: EstadoBoleto;

  @Column({ name: 'fecha_uso', type: 'timestamp', nullable: true })
  fechaUso?: Date | null;

  @Column({ name: 'validado_por', type: 'uuid', nullable: true })
  validadoPor?: string | null;

  @Column({ name: 'id_funcion_externa', type: 'uuid', nullable: true })
  idFuncionExterna?: string | null;

  @Column({ name: 'id_pelicula_externa', type: 'uuid', nullable: true })
  idPeliculaExterna?: string | null;

  @Column({ name: 'titulo_pelicula', type: 'varchar', length: 255, nullable: true })
  tituloPelicula?: string | null;

  @Column({ name: 'fecha_funcion', type: 'date', nullable: true })
  fechaFuncion?: string | null;

  @Column({ name: 'hora_funcion', type: 'time', nullable: true })
  horaFuncion?: string | null;

  @Column({ name: 'sala_nombre', type: 'varchar', length: 100, nullable: true })
  salaNombre?: string | null;

  @ManyToOne(() => Reserva, (reserva) => reserva.boletos, { eager: true })
  @JoinColumn({ name: 'id_reserva' })
  reserva!: Reserva;
}
