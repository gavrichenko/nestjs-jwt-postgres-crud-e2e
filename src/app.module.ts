import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import configValidationSchema from '../config/configValidationSchema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: configValidationSchema,
      isGlobal: true, // ability to use ConfigModule in other modules
    }),
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
