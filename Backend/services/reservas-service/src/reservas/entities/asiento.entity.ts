import { Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { ReservaDetalle } from './reserva-detalle.entity';

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

  @OneToMany(() => ReservaDetalle, (detalle) => detalle.asiento)
  detalles!: ReservaDetalle[];
}
