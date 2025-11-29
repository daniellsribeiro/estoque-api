import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProductSizeDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome deve ser preenchido' })
  @MaxLength(30, { message: 'Nome deve ter no máximo 30 caracteres' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Código deve conter pelo menos 1 caractere' })
  @MinLength(1, { message: 'Código deve conter pelo menos 1 caractere' })
  @MaxLength(3, { message: 'Código deve ter no máximo 3 caracteres' })
  codigo: string;
}
