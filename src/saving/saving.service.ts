import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Saving } from './saving.entity';
import { UpdateSavingDto } from './dto/update-saving.dto';

@Injectable()
export class SavingService {
  constructor(
    @InjectRepository(Saving)
    private readonly savingRepo: Repository<Saving>,
  ) {}

  async upsertSaving(userId: number, dto: UpdateSavingDto) {
    const month = dto.month.charAt(0).toUpperCase() + dto.month.slice(1).toLowerCase();

    let saving = await this.savingRepo.findOne({
      where: { user: { id: userId }, month, year: dto.year },
    });

    if (saving) {
      saving.amount = dto.amount;
    } else {
      saving = this.savingRepo.create({
        user: { id: userId },
        month,
        year: dto.year,
        amount: dto.amount,
      });
    }

    await this.savingRepo.save(saving);

    return {
      message: 'Monthly saving saved successfully',
      saving,
    };
  }

  async getSavingByMonthAndYear(userId: number, month: string, year: number) {
    const saving = await this.savingRepo.findOne({
      where: { user: { id: userId }, month, year },
    });

    if (!saving) {
      throw new BadRequestException('Saving not found for this month and year');
    }

    return saving;
  }

  async getAllSavings(userId: number) {
  return this.savingRepo.find({
    where: { user: { id: userId } },
    order: { year: 'DESC', month: 'ASC' },
  });
}

}
