import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateFuncionDto {
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  hora: string;

  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @IsNumber()
  @IsNotEmpty()
  id_pelicula: number;

  @IsNumber()
  @IsNotEmpty()
  id_sala: number;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
