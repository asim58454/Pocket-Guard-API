import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties that are not in the DTO
      forbidNonWhitelisted: true, // throw error if unknown props exist
      transform: true, // auto-transform payloads to DTO instances
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
