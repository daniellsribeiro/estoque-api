import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentTypeDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxaFixa?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxaPercentual?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxaParcela?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  descontoPercentual?: number;

  @IsBoolean()
  @IsOptional()
  parcelavel?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minParcelas?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxParcelas?: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
