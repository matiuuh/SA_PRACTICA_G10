import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCiudadDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
