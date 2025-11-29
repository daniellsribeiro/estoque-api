import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdatePurchasePaymentDto {
  @IsString()
  statusPagamento: string;

  @IsDateString()
  @IsOptional()
  dataPagamento?: string;
}
