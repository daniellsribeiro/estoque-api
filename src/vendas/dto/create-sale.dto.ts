import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class SaleItemDto {
  @IsString()
  produtoId: string;

  @IsNumber()
  @Min(0.0001)
  qtde: number;

  @IsNumber()
  @Min(0)
  precoUnit: number;
}

export class CreateSaleDto {
  @IsDateString()
  data: string;

  @IsString()
  clienteId: string;

  @IsString()
  tipoPagamentoId: string;

  @IsOptional()
  @IsString()
  cartaoContaId?: string;

  @IsOptional()
  @IsString()
  regraId?: string;

  @IsOptional()
  @IsBoolean()
  usarEscalonadoPadrao?: boolean;

  @IsOptional()
  @IsNumber()
  prazoRecebimentoDias?: number;

  @IsOptional()
  @IsBoolean()
  pagoAgora?: boolean;

  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @IsNumber()
  @Min(1)
  parcelas: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  frete?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descontoTotal?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  itens: SaleItemDto[];
}
