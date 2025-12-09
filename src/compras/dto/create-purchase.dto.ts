import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseItemInput {
  @IsUUID('all')
  produtoId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  qtde: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valorUnit: number;
}

export class CreatePurchaseDto {
  @IsDateString()
  data: string;

  @IsUUID('all')
  fornecedorId: string;

  @IsUUID('all')
  tipoPagamentoId: string;

  @IsUUID('all')
  @IsOptional()
  cartaoContaId?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  parcelas: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCompra: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  observacoes?: string;

  @ValidateNested({ each: true })
  @Type(() => PurchaseItemInput)
  @IsArray()
  @ArrayMinSize(1)
  itens: PurchaseItemInput[];
}
