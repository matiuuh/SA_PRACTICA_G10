import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class InternalValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  administradorId!: string;
}
