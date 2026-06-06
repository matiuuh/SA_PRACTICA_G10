import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Cine } from './cine.entity';

@Entity({ name: 'ciudades' })
export class Ciudad {
  @PrimaryColumn({ name: 'id_ciudad', type: 'uuid' })
  id: string;

  @Column()
  nombre: string;

  @OneToMany(() => Cine, (cine) => cine.ciudad)
  cines: Cine[];
}
