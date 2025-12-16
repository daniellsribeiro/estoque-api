import { IsOptional, IsString } from 'class-validator';

export class SaleFilterDto {
  @IsOptional()
  @IsString()
  dataInicio?: string;

  @IsOptional()
  @IsString()
  dataFim?: string;

  @IsOptional()
  @IsString()
  clienteNome?: string;

  @IsOptional()
  @IsString()
  tipoPagamentoId?: string;

  @IsOptional()
  @IsString()
  tipoPagamento?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
