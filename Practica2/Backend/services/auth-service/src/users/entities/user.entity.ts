import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'usuarios' })
export class User {
  @PrimaryColumn({ name: 'id_usuario', type: 'uuid' })
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @ManyToOne(() => Role, (role) => role.usuarios, { eager: true })
  @JoinColumn({ name: 'id_rol' })
  rol: Role;
}
