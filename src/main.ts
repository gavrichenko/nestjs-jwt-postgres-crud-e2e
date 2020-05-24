import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setupSwagger';

const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupSwagger(app);
  await app.listen(PORT);
}
bootstrap();

console.info(`Server was running on http://127.0.0.1:${PORT}`);
