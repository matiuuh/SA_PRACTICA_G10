import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateReservaDto {
  @IsUUID()
  usuarioIdExterno!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  asientosIds!: string[];

  @IsNumber()
  @Min(0)
  total!: number;

  @IsOptional()
  fechaExpiracion?: string;
}
