import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class DevolverVendaDto {
  @IsDateString()
  dataDevolucao: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo?: string;
}

