// src/expense/dto/create-expense.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a valid number' })
  price: number;

  @IsDateString({ strict: true }, { message: 'Date must be a valid ISO 8601 date string' })
  date: string;

  @IsNotEmpty({ message: 'Category is required' })
  category: string; // New field

  @IsNotEmpty({ message: 'Day is required' })
  day: string;
}
