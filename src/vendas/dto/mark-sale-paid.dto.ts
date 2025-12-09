import { IsDateString, IsOptional } from 'class-validator';

export class MarkSalePaidDto {
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;
}
