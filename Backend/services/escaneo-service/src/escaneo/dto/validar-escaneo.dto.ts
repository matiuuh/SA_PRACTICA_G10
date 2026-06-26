import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidarEscaneoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  codigo!: string;
}
