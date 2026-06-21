import { Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { ReservaDetalle } from './reserva-detalle.entity';
import { EstadoAsiento } from '../enums/estado-asiento.enum';

@Entity({ name: 'asientos' })
@Unique('asiento_por_funcion_unico', ['idFuncionExterna', 'fila', 'numero'])
export class Asiento {
  @PrimaryColumn({ name: 'id_asiento', type: 'uuid' })
  id!: string;

  @Column()
  fila!: string;

  @Column()
  numero!: number;

  @Column({ name: 'id_funcion_externa', type: 'uuid' })
  idFuncionExterna!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoAsiento.DISPONIBLE,
  })
  estado!: EstadoAsiento;

  @OneToMany(() => ReservaDetalle, (detalle) => detalle.asiento)
  detalles!: ReservaDetalle[];
}
