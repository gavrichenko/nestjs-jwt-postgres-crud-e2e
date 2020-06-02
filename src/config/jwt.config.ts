import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const JwtModuleOptions: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('jwt.secret_access'), // don't forget: it's use also in JwtStrategy
    signOptions: {
      expiresIn: configService.get<string>('jwt.accessTokenExpiresIn'),
    },
  }),
};
