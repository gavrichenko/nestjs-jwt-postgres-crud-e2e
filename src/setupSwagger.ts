import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

function getSwaggerOptions() {
  return new DocumentBuilder()
    .setTitle('API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}
export function setupSwagger(app: INestApplication) {
  return Promise.resolve(
    SwaggerModule.setup(
      'swagger',
      app,
      SwaggerModule.createDocument(app, getSwaggerOptions()),
    ),
  );
}
