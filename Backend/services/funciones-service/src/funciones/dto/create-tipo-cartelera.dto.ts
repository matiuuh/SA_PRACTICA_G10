import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTipoCarteleraDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}
