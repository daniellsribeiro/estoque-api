import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateProductColorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30, { message: 'Nome deve ter no máximo 30 caracteres' })
  nome: string;

  @IsString()
  @Length(3, 3, { message: 'Código deve ter exatamente 3 caracteres' })
  codigo: string;
}
