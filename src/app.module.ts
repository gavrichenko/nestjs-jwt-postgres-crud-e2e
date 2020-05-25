import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      // validationSchema: TODO https://docs.nestjs.com/techniques/configuration#schema-validation
      validationOptions: {
        allowUnknown: false, // controls whether or not to allow unknown keys in the environment variables
      },
      isGlobal: false, // ability to use ConfigModule in other modules
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
