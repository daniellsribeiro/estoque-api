import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStockAdjustDto {
  @IsNumber()
  @Min(0.0001)
  quantidade: number;

  @IsString()
  motivo: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsUUID()
  compraId?: string;

  @IsOptional()
  @IsUUID()
  vendaId?: string;
}
