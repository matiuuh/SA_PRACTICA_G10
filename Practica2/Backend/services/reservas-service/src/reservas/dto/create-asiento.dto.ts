import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateAsientoDto {
  @IsString()
  @IsNotEmpty()
  fila!: string;

  @IsInt()
  @Min(1)
  numero!: number;

  @IsUUID()
  idFuncionExterna!: string;
}
