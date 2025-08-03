import { IsString, IsNumber, Min } from 'class-validator';

export class UpdateSavingDto {
  @IsString()
  month: string;

  @IsNumber()
  year: number;

  @IsNumber()
  @Min(0)
  amount: number;
}
