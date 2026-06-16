import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class PaginateSalasDto {
  @Transform(({ value }) => Number(value ?? 1))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Transform(({ value }) => Number(value ?? 10))
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;

  @IsUUID()
  @IsOptional()
  cine?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
