import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEstadoReservaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
