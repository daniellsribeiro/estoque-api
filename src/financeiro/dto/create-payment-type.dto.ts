import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePaymentTypeDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
