import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30, { message: 'Nome deve ter no máximo 30 caracteres' })
  nome: string;

  @IsUUID()
  tipoProdutoId: string;

  @IsUUID()
  @IsOptional()
  corId?: string;

  @IsUUID()
  @IsOptional()
  materialId?: string;

  @IsUUID()
  @IsOptional()
  tamanhoId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'Observação deve ter no máximo 30 caracteres' })
  observacao?: string;

  @Type(() => Number)
  @IsNumber()
  precoVendaAtual: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
