import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @Min(1)
  capacidad: number;

  @IsOptional()
  @IsString()
  tipoSala?: string;

  @IsUUID()
  idCine: string;
}
