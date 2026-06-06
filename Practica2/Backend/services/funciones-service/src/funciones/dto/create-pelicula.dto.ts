import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreatePeliculaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @IsString()
  @IsOptional()
  sinopsis?: string;

  @IsNumber()
  @IsOptional()
  duracion_minutos?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  poster_url?: string;

  @IsNumber()
  @IsNotEmpty()
  id_categoria: number;

  @IsNumber()
  @IsNotEmpty()
  id_tipo_cartelera: number;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
