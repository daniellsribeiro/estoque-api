import { IsOptional, IsString } from 'class-validator';

export class ExpenseFilterDto {
  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  dataInicio?: string;

  @IsOptional()
  @IsString()
  dataFim?: string;

  @IsOptional()
  @IsString()
  fornecedorId?: string;

  @IsOptional()
  @IsString()
  tipoPagamentoId?: string;

  @IsOptional()
  @IsString()
  tipoPagamento?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  gastoId?: string;
}
