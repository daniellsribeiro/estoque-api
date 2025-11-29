import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30, { message: 'Nome deve ter no máximo 30 caracteres' })
  nome: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
