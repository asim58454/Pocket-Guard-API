import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ExpenseModule } from './expense/expense.module';
import { ConfigModule } from '@nestjs/config';
import { BudgetModule } from './budget/budget.module';
import { SavingController } from './saving/saving.controller';
import { SavingModule } from './saving/saving.module';

@Module({
   imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'pocket-guard',
      synchronize: true, // ❗ Set to false in production
      autoLoadEntities: true,
    }),
    AuthModule,
    ExpenseModule,
    BudgetModule,
    SavingModule
  ],
  controllers: [AppController, SavingController],
  providers: [AppService],
})
export class AppModule {}
