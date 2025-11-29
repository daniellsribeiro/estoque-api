import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateProductPriceDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  precoVendaAtual: number;
}
