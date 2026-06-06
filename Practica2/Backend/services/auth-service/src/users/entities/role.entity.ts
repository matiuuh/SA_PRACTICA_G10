import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryColumn({ name: 'id_rol', type: 'uuid' })
  id!: string;

  @Column({ unique: true })
  nombre!: string;

  @OneToMany(() => User, (user) => user.rol)
  usuarios!: User[];
}
