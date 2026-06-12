import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEstadoPagoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
