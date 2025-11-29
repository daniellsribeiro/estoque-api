import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRecebimentoDto {
  @IsOptional()
  @IsString()
  vendaId?: string;

  @IsOptional()
  @IsString()
  tipoPagamentoId?: string;

  @IsOptional()
  @IsString()
  cartaoContaId?: string;

  @IsDateString()
  dataVenda: string;

  @IsNumber()
  @Min(1)
  parcelas: number;

  @IsNumber()
  valorTotal: number;

  @IsOptional()
  @IsString()
  regraId?: string;

  @IsOptional()
  @IsBoolean()
  usarEscalonadoPadrao?: boolean;

  @IsOptional()
  @IsNumber()
  prazoRecebimentoDias?: number;
}
