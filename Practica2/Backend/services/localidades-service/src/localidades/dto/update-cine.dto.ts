import { IsOptional, IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateCineDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  direccion?: string;

  @IsOptional()
  @IsUUID()
  idCiudad?: string;
}
