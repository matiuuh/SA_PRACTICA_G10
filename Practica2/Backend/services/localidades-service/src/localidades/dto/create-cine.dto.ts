import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCineDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  direccion!: string;

  @IsUUID()
  idCiudad!: string;
}
