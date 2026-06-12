import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePagoDto {
  @IsUUID()
  reservaIdExterna!: string;

  @IsNumber()
  @Min(0)
  monto!: number;

  @IsUUID()
  idMetodo!: string;

  @IsOptional()
  @IsUUID()
  idEstado?: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  autorizacion?: string;
}
