export const appConfig = () => ({
  host: process.env.HOST,
  port: parseInt(process.env.PORT, 10),
  jwt: {
    secret: process.env.SECRET_FOR_ACCESS_TOKEN,
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    logging: process.env.DATABASE_LOGGING.toLowerCase() === 'true',
  },
});
