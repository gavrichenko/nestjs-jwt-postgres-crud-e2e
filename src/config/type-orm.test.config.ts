import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from '../shared/entities/user.entity';
import { IdeaEntity } from '../shared/entities/idea.entity';

export const TypeOrmTestModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.user'),
    password: configService.get<string>('database.password'),
    database: 'e2e_test',
    logging: false,
    synchronize: true,
    ssl: false,
    entities: [UserEntity, IdeaEntity],
  }),
};
