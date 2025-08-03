import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { Expense } from 'src/expense/expense.entity';
import { User } from 'src/auth/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, Expense, User]), // ✅ Add Expense and User
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
