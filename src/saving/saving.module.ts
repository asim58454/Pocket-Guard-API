import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saving } from './saving.entity';
import { SavingService } from './saving.service';
import { SavingController } from './saving.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Saving])], // ✅ Add this
  controllers: [SavingController],
  providers: [SavingService],
   exports: [SavingService], 
})
export class SavingModule {}
