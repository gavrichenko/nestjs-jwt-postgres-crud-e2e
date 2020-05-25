import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setupSwagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('port');
  const HOST = configService.get<string>('host');

  await setupSwagger(app);

  await app.listen(PORT);
  console.info(`Server was running on http://${HOST}:${PORT}`);
}

bootstrap();
