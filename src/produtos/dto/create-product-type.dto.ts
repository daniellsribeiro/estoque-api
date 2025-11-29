import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30, { message: 'Nome deve ter no máximo 30 caracteres' })
  nome: string;

  @IsString()
  @Length(2, 2, { message: 'Código deve ter exatamente 2 caracteres' })
  codigo: string;
}
