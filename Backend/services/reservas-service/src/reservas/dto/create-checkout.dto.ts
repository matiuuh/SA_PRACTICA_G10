import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateCheckoutDto {
  @IsUUID()
  usuarioIdExterno!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  asientosIds!: string[];

  @IsNumber()
  @Min(0)
  total!: number;

  @IsIn(['TARJETA', 'PAYPAL'])
  metodoPago!: 'TARJETA' | 'PAYPAL';

  @IsOptional()
  @IsString()
  numeroTarjeta?: string;

  @IsOptional()
  @IsString()
  nombreTitular?: string;

  @IsOptional()
  @IsString()
  cvv?: string;

  @IsOptional()
  @IsEmail()
  paypalEmail?: string;

  @IsOptional()
  fechaExpiracion?: string;
}
