import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { TipoIncidencia } from '../enums/tipo-incidencia.enum';

export class CreateIncidenciaDto {
  @IsEnum(TipoIncidencia)
  tipo!: TipoIncidencia;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  asunto!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  descripcion!: string;
}
