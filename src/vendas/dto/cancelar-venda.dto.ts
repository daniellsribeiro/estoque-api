import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CancelarVendaDto {
  @IsDateString()
  dataCancelamento: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  motivoCancelamento: string;
}
