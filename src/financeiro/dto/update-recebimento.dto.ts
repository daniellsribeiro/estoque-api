import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateRecebimentoDto {
  @IsOptional()
  @IsString()
  status?: 'previsto' | 'recebido' | 'cancelado';

  @IsOptional()
  @IsDateString()
  dataRecebida?: string;
}
