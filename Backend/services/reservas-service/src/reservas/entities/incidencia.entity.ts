import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { EstadoIncidencia } from '../enums/estado-incidencia.enum';
import { TipoIncidencia } from '../enums/tipo-incidencia.enum';

@Entity({ name: 'incidencias' })
export class Incidencia {
  @PrimaryColumn({ name: 'id_incidencia', type: 'uuid' })
  id!: string;

  @Column({ name: 'usuario_id_externo', type: 'uuid' })
  usuarioIdExterno!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: TipoIncidencia;

  @Column({ type: 'varchar', length: 120 })
  asunto!: string;

  @Column({ type: 'varchar', length: 1000 })
  descripcion!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoIncidencia.PENDIENTE,
  })
  estado!: EstadoIncidencia;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  respuesta?: string | null;

  @Column({ name: 'administrador_id_externo', type: 'uuid', nullable: true })
  administradorIdExterno?: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion!: Date;

  @Column({ name: 'fecha_respuesta', type: 'timestamp', nullable: true })
  fechaRespuesta?: Date | null;
}
