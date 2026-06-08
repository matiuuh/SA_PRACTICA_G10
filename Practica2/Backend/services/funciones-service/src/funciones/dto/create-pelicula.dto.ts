import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePeliculaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @IsString()
  @IsOptional()
  sinopsis?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duracion_minutos?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  poster_url?: string;

  @IsUUID()
  @IsNotEmpty()
  id_categoria: string;

  @IsUUID()
  @IsNotEmpty()
  id_tipo_cartelera: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
