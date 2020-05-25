import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/app.config';
import configValidationSchema from '../config/app-config-validation-schema';
import TypeOrmModuleOptions from '../config/type-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: configValidationSchema,
      isGlobal: true, // ability to use ConfigModule in other modules
    }),
    TypeOrmModule.forRootAsync(TypeOrmModuleOptions),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
