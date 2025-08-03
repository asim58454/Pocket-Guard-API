// src/budget/budget.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BudgetService } from './budget.service';
import { SetBudgetDto } from './dto/set-budget.dto';
import { AuthRequest } from 'src/common/types/auth-request';

@UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async setBudget(@Body() dto: SetBudgetDto, @Req() req: AuthRequest) {
    return this.budgetService.setBudget(dto, req.user.userId);
  }

  @Get('status')
  async getBudgetStatus(
    @Query('month') month: string,
    @Query('year') year: string,
    @Req() req: AuthRequest,
  ) {
    return this.budgetService.getBudgetStatus(
      req.user.userId,
      Number(month),
      Number(year),
    );
  }
}
