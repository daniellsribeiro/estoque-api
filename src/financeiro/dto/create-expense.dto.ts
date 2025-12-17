import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ExpenseItemInput {
  @IsString({ message: 'Descrição é obrigatória' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  qtde: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valorUnit: number;
}

export class CreateExpenseDto {
  @IsDateString()
  data: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(255)
  descricao: string;

  @IsUUID('all')
  tipoPagamentoId: string;

  @IsUUID('all')
  @IsOptional()
  cartaoContaId?: string;

  @IsUUID('all')
  @IsOptional()
  fornecedorId?: string;

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
  @Type(() => ExpenseItemInput)
  @IsArray()
  @ArrayMinSize(1)
  itens: ExpenseItemInput[];
}
