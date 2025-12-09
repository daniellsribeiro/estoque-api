import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSalePaymentDto {
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

  @IsNumber()
  @Min(1)
  parcelas: number;

  @IsOptional()
  @IsBoolean()
  pagoAgora?: boolean;

  @IsOptional()
  @IsDateString()
  dataPagamento?: string;
}
