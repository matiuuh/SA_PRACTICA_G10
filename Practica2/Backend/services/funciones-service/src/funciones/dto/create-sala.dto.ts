import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  capacidad: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  tipo?: string;

  @IsNumber()
  @IsNotEmpty()
  id_cine_externo: number;
}
