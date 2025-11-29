import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCardPaymentRuleDto {
  @IsString()
  cartaoId: string;

  @IsString()
  tipo: string;

  @IsNumber()
  @IsOptional()
  taxaPercentual?: number;

  @IsNumber()
  @IsOptional()
  taxaFixa?: number;

  @IsNumber()
  @IsOptional()
  adicionalParcela?: number;

  @IsNumber()
  @IsOptional()
  prazoRecebimentoDias?: number;

  @IsBoolean()
  @IsOptional()
  prazoEscalonadoPadrao?: boolean;
}
