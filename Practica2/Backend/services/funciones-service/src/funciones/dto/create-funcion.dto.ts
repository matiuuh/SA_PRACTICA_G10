import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFuncionDto {
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  hora: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  precio: number;

  @IsUUID()
  @IsNotEmpty()
  id_pelicula: string;

  @IsUUID()
  @IsNotEmpty()
  id_sala: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
