// src/budget/budget.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Budget } from './budget.entity';
import { SetBudgetDto } from './dto/set-budget.dto';
import { Expense } from 'src/expense/expense.entity';
import Decimal from 'decimal.js';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
  ) {}

  async setBudget(dto: SetBudgetDto, userId: number) {
    let budget = await this.budgetRepo.findOne({
      where: { user: { id: userId }, month: dto.month, year: dto.year },
    });

    if (budget) {
      console.log('Existing budget found:', budget.amount);
      budget.amount = new Decimal(budget.amount).plus(dto.amount).toNumber();
      console.log('Updated amount:', budget.amount);
    } else {
      budget = this.budgetRepo.create({
        ...dto,
        user: { id: userId },
      });
    }

    await this.budgetRepo.save(budget);
    return { message: 'Budget set successfully', budget };
  }

  async getBudgetStatus(userId: number, month: number, year: number) {
    const budget = await this.budgetRepo.findOne({
      where: { user: { id: userId }, month, year },
    });

    if (!budget) return { message: 'No budget set', spent: 0, remaining: 0 };

    // const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0, 23, 59, 59);
    const firstDay = new Date(year, month - 1, 1);
const lastDay = new Date(year, month, 0, 23, 59, 59); // Note: month stays same, 0 gives last day of prev month


    const expenses = await this.expenseRepo.find({
      where: {
        user: { id: userId },
        date: Between(firstDay, lastDay),
      },
    });

    const spent = expenses.reduce(
      (sum, e) => new Decimal(sum).plus(e.price).toNumber(),
      0,
    );

    const remaining = new Decimal(budget.amount).minus(spent).toNumber();

    return {
      month,
      year,
      budget: Number(budget.amount),
      spent,
      remaining,
      exceeded: remaining < 0,
    };
  }
}
