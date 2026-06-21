import { IsString, MaxLength, MinLength } from 'class-validator';

export class RespondIncidenciaDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  respuesta!: string;
}
