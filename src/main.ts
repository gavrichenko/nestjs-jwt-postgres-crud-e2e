import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './setupSwagger';
import { ValidationPipe } from './shared/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('port');
  const HOST = configService.get<string>('host');

  app.setGlobalPrefix('api/v1'); // Setting base path
  app.useGlobalPipes(new ValidationPipe()); // Initialize global validation
  await setupSwagger(app);

  await app.listen(PORT, () =>
    Logger.verbose(`Server running on http://${HOST}:${PORT}`, 'Bootstrap'),
  );
}

bootstrap();
