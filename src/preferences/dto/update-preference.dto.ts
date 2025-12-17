import { IsInt, Min } from 'class-validator';

export class UpdatePreferenceDto {
  @IsInt()
  @Min(0)
  alertaEstoque: number;
}

