import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { appConfig, configValidationSchema, TypeOrmTestModuleOptions } from '../src/config';

/**
 * USE ONLY FOR TESTS
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(TypeOrmTestModuleOptions), // test-config for TypeOrm
  ],
  controllers: [],
  providers: [],
})
export class AppTestModule {}
