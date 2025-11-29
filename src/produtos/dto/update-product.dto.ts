import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'Nome deve ter no máximo 30 caracteres' })
  nome?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'Observação deve ter no máximo 30 caracteres' })
  observacao?: string;
}
