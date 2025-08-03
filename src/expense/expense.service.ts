import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import cloudinary from 'src/config/cloudinary.config';
import toStream = require('buffer-to-stream');
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { groupBy } from 'lodash'; // optionally install lodash for grouping
import { ILike, Raw } from 'typeorm';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {}

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'expenses' },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve(result.secure_url);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }

  async addExpense(
    dto: CreateExpenseDto,
    file: Express.Multer.File,
    userId: number,
  ) {
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Image is required');
    }

    const imageUrl = await this.uploadToCloudinary(file);

    const expense = this.expenseRepo.create({
      ...dto,
      image: imageUrl,
      user: { id: userId },
      day:
        dto.day ||
        new Date(dto.date).toLocaleDateString('en-US', {
          weekday: 'long',
        }),
    });

    await this.expenseRepo.save(expense);

    return {
      message: 'Expense added successfully',
      expense,
    };
  }

async getAllExpenses(userId: number) {
  const expenses = await this.expenseRepo.find({
    where: { user: { id: userId } },
    order: { date: 'DESC' },
  });

  const result = expenses.map((expense) => {
    const dateObj = new Date(expense.date);
    return {
      ...expense,
      month: dateObj.toLocaleString('default', { month: 'long' }),
      day: dateObj.toLocaleString('default', { weekday: 'long' }),
      year: dateObj.getFullYear(),
    };
  });

  return {
    total: result.length,
    expenses: result,
  };
}

  async updateExpense(
  id: number,
  dto: UpdateExpenseDto,
  file: Express.Multer.File,
  userId: number,
) {
  const expense = await this.expenseRepo.findOne({
    where: { id, user: { id: userId } },
  });

  if (!expense) throw new BadRequestException('Expense not found');

  if (file && file.mimetype.startsWith('image/')) {
    expense.image = await this.uploadToCloudinary(file);
  }

  if (dto.name) expense.name = dto.name;
  if (dto.description) expense.description = dto.description;
  if (dto.price) expense.price = dto.price;
  if (dto.date) {
    expense.date = new Date(dto.date);
    expense.day = new Date(dto.date).toLocaleDateString('en-US', { weekday: 'long' });
  }

  await this.expenseRepo.save(expense);
  return { message: 'Expense updated successfully', expense };
}

async deleteExpense(id: number, userId: number) {
  const expense = await this.expenseRepo.findOne({
    where: { id, user: { id: userId } },
  });

  if (!expense) throw new BadRequestException('Expense not found');

  await this.expenseRepo.remove(expense);
  return { message: 'Expense deleted successfully' };
}

async getExpensesByMonthAndYear(userId: number, monthName: string, year: number) {
  const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();

  if (isNaN(monthIndex)) {
    throw new BadRequestException('Invalid month name');
  }

  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
    order: { date: 'DESC' },
  });

  const result = expenses.map((expense) => {
    const dateObj = new Date(expense.date);
    return {
      ...expense,
      month: dateObj.toLocaleString('default', { month: 'long' }),
      day: dateObj.toLocaleString('default', { weekday: 'long' }),
      year: dateObj.getFullYear(),
    };
  });

  return {
    month: monthName,
    year,
    total: result.length,
    expenses: result,
  };
}


async getExpensesByYear(userId: number, year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
    order: { date: 'DESC' },
  });

  const result = expenses.map((expense) => {
    const dateObj = new Date(expense.date);
    return {
      ...expense,
      month: dateObj.toLocaleString('default', { month: 'long' }),
      day: dateObj.toLocaleString('default', { weekday: 'long' }),
      year: dateObj.getFullYear(),
    };
  });

  return {
    year,
    total: result.length,
    expenses: result,
  };
}

async getExpensesByDate(userId: number, dateStr: string) {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
    order: { date: 'DESC' },
  });

  const formattedDate = {
    date: dateStr,
    day: date.toLocaleString('default', { weekday: 'long' }),
    month: date.toLocaleString('default', { month: 'long' }),
    year: date.getFullYear(),
    total: expenses.length,
    expenses: expenses.map((expense) => {
      const expDate = new Date(expense.date);
      return {
        ...expense,
        day: expDate.toLocaleString('default', { weekday: 'long' }),
        month: expDate.toLocaleString('default', { month: 'long' }),
        year: expDate.getFullYear(),
      };
    }),
  };

  return formattedDate;
}

  async filterExpensesByCategory(userId: number, category: string) {
    const expenses = await this.expenseRepo.find({
      where: {
        user: { id: userId },
        category: category,
      },
      order: { date: 'DESC' },
    });

    const result = expenses.map((expense) => ({
      ...expense,
      month: new Date(expense.date).toLocaleString('default', { month: 'long' }),
      year: new Date(expense.date).getFullYear(), // Add year to the response
    }));

    return {
      category,
      total: result.length,
      expenses: result,
    };
  }


async getMonthlySummary(userId: number, monthInput: string, year: number) {
  if (!monthInput || !year) {
    throw new BadRequestException('Month and year are required');
  }

  // Normalize month string (e.g., "june" -> "June")
  const month = monthInput.charAt(0).toUpperCase() + monthInput.slice(1).toLowerCase();

  // Validate month name
  const validMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!validMonths.includes(month)) {
    throw new BadRequestException('Invalid month name. Must be a valid English month.');
  }

  const monthIndex = validMonths.indexOf(month); // 0-based index

  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(startDate, endDate),
    },
  });

  const summary = {
    month,
    year,
    totalAmount: 0,
    totalExpenses: 0,
    byCategory: {},
  };

  for (const expense of expenses) {
    summary.totalAmount += expense.price;
    summary.totalExpenses += 1;
    summary.byCategory[expense.category] =
      (summary.byCategory[expense.category] || 0) + expense.price;
  }

  return { summary };
}



async compareMonthlySpending(
  userId: number,
  currentMonthInput: string,
  currentYear: number,
  compareMonthInput: string,
  compareYear: number,
) {
  const validMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Normalize and validate
  const normalizeMonth = (month: string) =>
    month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

  const currentMonth = normalizeMonth(currentMonthInput);
  const compareMonth = normalizeMonth(compareMonthInput);

  if (!validMonths.includes(currentMonth) || !validMonths.includes(compareMonth)) {
    throw new BadRequestException('Invalid month name provided.');
  }

  const currentMonthIndex = validMonths.indexOf(currentMonth);
  const compareMonthIndex = validMonths.indexOf(compareMonth);

  const currentStart = new Date(currentYear, currentMonthIndex, 1);
  const currentEnd = new Date(currentYear, currentMonthIndex + 1, 0, 23, 59, 59);

  const compareStart = new Date(compareYear, compareMonthIndex, 1);
  const compareEnd = new Date(compareYear, compareMonthIndex + 1, 0, 23, 59, 59);

  const currentExpenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(currentStart, currentEnd),
    },
  });

  const compareExpenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(compareStart, compareEnd),
    },
  });

  const currentSpending = currentExpenses.reduce((sum, e) => sum + e.price, 0);
  const compareSpending = compareExpenses.reduce((sum, e) => sum + e.price, 0);
  const difference = currentSpending - compareSpending;

  let trend: 'increase' | 'decrease' | 'same' = 'same';
  if (difference > 0) trend = 'increase';
  else if (difference < 0) trend = 'decrease';

  return {
    current: {
      month: currentMonth,
      year: currentYear,
      spending: +currentSpending.toFixed(2),
    },
    comparison: {
      month: compareMonth,
      year: compareYear,
      spending: +compareSpending.toFixed(2),
    },
    difference: +difference.toFixed(2),
    trend,
  };
}

async getUserCategories(userId: number) {
  const categories = await this.expenseRepo
    .createQueryBuilder('expense')
    .select('DISTINCT expense.category', 'category')
    .where('expense.userId = :userId', { userId })
    .andWhere('expense.category IS NOT NULL')
    .getRawMany();

  // Extract only category names as an array of strings
  return categories.map(c => c.category);
}



async getDailySpending(userId: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
  });

  const map: Record<string, number> = {};

  // Initialize all days of current month with 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    map[key] = 0;
  }

  for (const exp of expenses) {
    const key = new Date(exp.date).toISOString().split('T')[0];
    map[key] += exp.price;
  }

  const labels = Object.keys(map);
  const data = Object.values(map);

  return { labels, data };
}


async getWeeklySpending(userId: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
  });

  const weeks = [0, 0, 0, 0, 0]; // up to 5 weeks

  for (const exp of expenses) {
    const date = new Date(exp.date);
    const weekIndex = Math.floor((date.getDate() - 1) / 7);
    weeks[weekIndex] += exp.price;
  }

  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
  const data = weeks.slice(0, Math.ceil(end.getDate() / 7)); // remove unused weeks

  return { labels: labels.slice(0, data.length), data };
}

async getMonthlySpending(userId: number) {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
  });

  const monthly = Array(12).fill(0);

  for (const exp of expenses) {
    const month = new Date(exp.date).getMonth(); // 0 = Jan
    monthly[month] += exp.price;
  }

  const labels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return {
    year,
    labels,
    data: monthly
  };
}

async getYearlySpending(userId: number) {
  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
    },
  });

  const yearlyMap: Record<string, number> = {};

  for (const exp of expenses) {
    const year = new Date(exp.date).getFullYear().toString();
    yearlyMap[year] = (yearlyMap[year] || 0) + exp.price;
  }

  const labels = Object.keys(yearlyMap).sort();
  const data = labels.map(label => yearlyMap[label]);

  return {
    labels,
    data
  };
}

async getDailySpendingByCategory(userId: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
  });

  const categoryMap: Record<string, Record<string, number>> = {};

  for (const exp of expenses) {
    const dateKey = new Date(exp.date).toISOString().split('T')[0];
    const category = exp.category || 'Uncategorized';

    if (!categoryMap[category]) categoryMap[category] = {};
    if (!categoryMap[category][dateKey]) categoryMap[category][dateKey] = 0;

    categoryMap[category][dateKey] += exp.price;
  }

  return categoryMap; // { Food: { '2025-07-01': 50, ... }, Transport: { ... } }
}

async getWeeklySpendingByCategory(userId: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
  });

  const categoryMap: Record<string, number[]> = {};

  for (const exp of expenses) {
    const week = Math.floor((new Date(exp.date).getDate() - 1) / 7); // 0-based week
    const category = exp.category || 'Uncategorized';

    if (!categoryMap[category]) categoryMap[category] = [0, 0, 0, 0, 0];
    categoryMap[category][week] += exp.price;
  }

  return categoryMap; // { Food: [50, 120, 0, 80, 0], Travel: [...] }
}

async getMonthlySpendingByCategory(userId: number) {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
      date: Between(start, end),
    },
  });

  const categoryMap: Record<string, number[]> = {};

  for (const exp of expenses) {
    const month = new Date(exp.date).getMonth(); // 0-indexed
    const category = exp.category || 'Uncategorized';

    if (!categoryMap[category]) categoryMap[category] = Array(12).fill(0);
    categoryMap[category][month] += exp.price;
  }

  return categoryMap; // { Food: [100, 200, 150, ...], Rent: [...] }
}

async getYearlySpendingByCategory(userId: number) {
  const expenses = await this.expenseRepo.find({
    where: {
      user: { id: userId },
    },
  });

  const categoryMap: Record<string, Record<string, number>> = {};

  for (const exp of expenses) {
    const year = new Date(exp.date).getFullYear().toString();
    const category = exp.category || 'Uncategorized';

    if (!categoryMap[category]) categoryMap[category] = {};
    if (!categoryMap[category][year]) categoryMap[category][year] = 0;

    categoryMap[category][year] += exp.price;
  }

  return categoryMap; // { Food: { 2024: 500, 2025: 700 }, Transport: { ... } }
}

}
