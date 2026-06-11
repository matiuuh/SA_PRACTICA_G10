import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMetodoPagoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
