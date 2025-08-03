import { Module, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register({
      storage: require('multer').memoryStorage(),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Needed to use ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const logger = new Logger('AuthModule');
        
        logger.log(`JWT_SECRET in AuthModule: ${jwtSecret ? 'SET' : 'NOT SET'}`);
        
        if (!jwtSecret) {
          logger.error('JWT_SECRET is not configured in AuthModule');
          throw new Error('JWT_SECRET is not configured. Please add JWT_SECRET to your .env file.');
        }
        
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
