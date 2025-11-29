import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCardInvoicePaymentDto {
  @IsUUID()
  cartaoContaId: string;

  @IsString()
  @IsNotEmpty()
  mesReferencia: string; // formato YYYY-MM

  @IsDateString()
  dataPagamentoReal: Date;
}
