import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setupSwagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');

  await setupSwagger(app);

  await app.listen(PORT);
  console.info(`Server was running on http://127.0.0.1:${PORT}`);
}

bootstrap();
