import * as ms from 'ms';

export const appConfig = () => ({
  host: process.env.HOST,
  port: parseInt(process.env.PORT, 10),
  jwt: {
    secret_access: process.env.SECRET_FOR_ACCESS_TOKEN,
    secret_refresh: process.env.SECRET_FOR_REFRESH_TOKEN,
    accessTokenExpiresIn: ms(process.env.JWT_ACCESS_EXPIRES_IN) as number,
    refreshTokenExpiresIn: ms(process.env.JWT_REFRESH_EXPIRES_IN) as number,
  },
  database: {
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT, 10),
    user: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    name: process.env.TYPEORM_DATABASE,
    logging: process.env.TYPEORM_LOGGING.toLowerCase() === 'true',
    synchronize: process.env.TYPEORM_SYNCHRONIZE.toLowerCase() === 'true',
  },
});
