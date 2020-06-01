import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setupSwagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('port');
  const HOST = configService.get<string>('host');

  app.setGlobalPrefix('api/v1');
  await setupSwagger(app);

  await app.listen(PORT, () =>
    Logger.verbose(`Server running on http://${HOST}:${PORT}`, 'Bootstrap'),
  );
}

bootstrap();
