import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class PaginatePeliculasDto {
  @Transform(({ value }) => Number(value ?? 1))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Transform(({ value }) => Number(value ?? 10))
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  id_categoria?: string;

  @IsUUID()
  @IsOptional()
  id_tipo_cartelera?: string;

  @IsUUID()
  @IsOptional()
  tipo_cartelera?: string;

  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
