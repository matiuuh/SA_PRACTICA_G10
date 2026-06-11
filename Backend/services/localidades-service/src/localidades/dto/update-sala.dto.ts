import { IsOptional, IsString, IsNotEmpty, IsInt, IsUUID, Min } from 'class-validator';

export class UpdateSalaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacidad?: number;

  @IsOptional()
  @IsString()
  tipoSala?: string;

  @IsOptional()
  @IsUUID()
  idCine?: string;
}
