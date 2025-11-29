import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCardAccountDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  banco?: string;

  @IsString()
  @IsOptional()
  bandeira?: string;

  @IsNumber()
  @IsOptional()
  diaFechamento?: number;

  @IsNumber()
  @IsOptional()
  diaVencimento?: number;

  @IsString()
  @IsOptional()
  pixChave?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
