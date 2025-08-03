import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ExpenseModule } from './expense/expense.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BudgetModule } from './budget/budget.module';
import { SavingController } from './saving/saving.controller';
import { SavingModule } from './saving/saving.module';

@Module({
   imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: configService.get('NODE_ENV') === 'development', // ❗ Set to false in production
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
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
