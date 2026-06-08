import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  capacidad: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  tipo?: string;

  @IsUUID()
  @IsNotEmpty()
  id_cine_externo: string;
}
