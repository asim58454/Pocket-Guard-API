// src/expense/dto/update-expense.dto.ts
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

   @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Date must be in ISO format' })
  date?: string;
}
