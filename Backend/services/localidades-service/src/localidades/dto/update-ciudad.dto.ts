import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateCiudadDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;
}
