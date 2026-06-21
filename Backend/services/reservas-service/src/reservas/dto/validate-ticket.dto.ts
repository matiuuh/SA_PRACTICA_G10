import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  codigo!: string;
}
