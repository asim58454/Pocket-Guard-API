import { Query } from '@nestjs/common';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Get,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuthRequest } from 'src/common/types/auth-request';


@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async addExpense(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateExpenseDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.userId;
    return this.expenseService.addExpense(dto, file, userId);
  }

  @Get()
  async getAllExpenses(@Req() req: AuthRequest) {
    const userId = req.user.userId;
    return this.expenseService.getAllExpenses(userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateExpenseDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.userId;
    return this.expenseService.updateExpense(id, dto, file, userId);
  }

  @Delete(':id')
  async deleteExpense(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.userId;
    return this.expenseService.deleteExpense(id, userId);
  }

@Get('categories')
async getUserCategories(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getUserCategories(userId);
}


 @Get('by-month-year')
async getByMonthAndYear(
  @Req() req: AuthRequest,
  @Query('month') monthName: string,
  @Query('year') year: number,
) {
  const userId = req.user.userId;
  return this.expenseService.getExpensesByMonthAndYear(userId, monthName, year);
}

@Get('by-year')
async getByYear(@Req() req: AuthRequest, @Query('year') year: number) {
  const userId = req.user.userId;
  return this.expenseService.getExpensesByYear(userId, year);
}

@Get('by-date')
async getByDate(@Req() req: AuthRequest, @Query('date') date: string) {
  const userId = req.user.userId;
  return this.expenseService.getExpensesByDate(userId, date);
}

@Get('filter')
async filterByCategory(
  @Req() req: AuthRequest,
  @Query('category') category: string,
) {
  const userId = req.user.userId;
  return this.expenseService.filterExpensesByCategory(userId, category);
}

@Get('monthly-summary')
async getMonthlySummary(
  @Req() req: AuthRequest,
  @Query('month') month: string,
  @Query('year') year: string,
) {
  const userId = req.user.userId;
  return this.expenseService.getMonthlySummary(userId, month, +year);
}


@Get('compare-monthly')
async compareMonthlySpending(
  @Req() req: AuthRequest,
  @Query('currentMonth') currentMonth: string,
  @Query('currentYear') currentYear: string,
  @Query('compareMonth') compareMonth: string,
  @Query('compareYear') compareYear: string,
) {
  const userId = req.user.userId;
  return this.expenseService.compareMonthlySpending(
    userId,
    currentMonth,
    Number(currentYear),
    compareMonth,
    Number(compareYear),
  );
}


@Get('analytics/daily')
async getDailyAnalytics(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getDailySpending(userId);
}

@Get('analytics/weekly')
async getWeeklyAnalytics(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getWeeklySpending(userId);
}

@Get('analytics/monthly')
async getMonthlyAnalytics(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getMonthlySpending(userId);
}

@Get('analytics/yearly')
async getYearlyAnalytics(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getYearlySpending(userId);
}

@Get('analytics/daily-category')
async getDailyCategoryAnalytics(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getDailySpendingByCategory(userId);
}

@Get('analytics/weekly-category')
async getWeeklyCategoryAnalytics(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getWeeklySpendingByCategory(userId);
}

@Get('analytics/monthly-category')
async getMonthlyCategoryAnalytics(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getMonthlySpendingByCategory(userId);
}

@Get('analytics/yearly-category')
async getYearlyCategoryAnalytics(@Req() req: AuthRequest) {
  const userId = req.user.userId;
  return this.expenseService.getYearlySpendingByCategory(userId);
}

}
