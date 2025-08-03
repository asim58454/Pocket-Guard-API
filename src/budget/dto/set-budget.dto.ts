// src/budget/dto/set-budget.dto.ts
import { IsNumber, Min, Max, IsInt } from 'class-validator';

export class SetBudgetDto {
  @IsInt() @Min(0) @Max(11)
  month: number;

  @IsInt()
  year: number;

  @IsNumber()
  amount: number;
}
