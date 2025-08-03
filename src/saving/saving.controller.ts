import { Controller, Patch, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SavingService } from './saving.service';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { AuthRequest } from 'src/common/types/auth-request';

@Controller('savings')
@UseGuards(JwtAuthGuard)
export class SavingController {
  constructor(private readonly savingService: SavingService) {}

  @Patch()
  async upsertSaving(@Req() req: AuthRequest, @Body() dto: UpdateSavingDto) {
    const userId = req.user.userId;
    return this.savingService.upsertSaving(userId, dto);
  }

  @Get('by-month-year')
  async getSaving(
    @Req() req: AuthRequest,
    @Query('month') month: string,
    @Query('year') year: number,
  ) {
    const userId = req.user.userId;
    return this.savingService.getSavingByMonthAndYear(userId, month, year);
  }

  @Get() // ✅ NEW ROUTE
  async getAllSavings(@Req() req: AuthRequest) {
    const userId = req.user.userId;
    return this.savingService.getAllSavings(userId);
  }
}
