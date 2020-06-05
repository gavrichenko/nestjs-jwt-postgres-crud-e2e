import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from '../shared/entities/user.entity';
import { IdeaEntity } from '../shared/entities/idea.entity';

export const TypeOrmTestModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('database_test.host'),
    port: configService.get<number>('database_test.port'),
    username: configService.get<string>('database_test.user'),
    password: configService.get<string>('database_test.password'),
    database: configService.get<string>('database_test.name'),
    logging: configService.get<boolean>('database_test.logging'),
    synchronize: configService.get<boolean>('database_test.synchronize'),
    ssl: false,
    entities: [UserEntity, IdeaEntity],
  }),
};
