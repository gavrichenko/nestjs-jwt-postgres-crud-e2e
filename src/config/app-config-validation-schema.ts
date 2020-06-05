import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  // application Configuration
  PORT: Joi.number().required(),
  HOST: Joi.string().required(),
  // project Settings
  SECRET_FOR_ACCESS_TOKEN: Joi.string().required(),
  SECRET_FOR_REFRESH_TOKEN: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
  // configuration typeorm cli
  TYPEORM_CONNECTION: Joi.string().required(),
  TYPEORM_MIGRATIONS: Joi.string().required(),
  TYPEORM_MIGRATIONS_DIR: Joi.string().required(),
  TYPEORM_ENTITIES: Joi.string().required(),
  // configuration typeorm
  TYPEORM_HOST: Joi.string().required(),
  TYPEORM_PORT: Joi.number().required(),
  TYPEORM_USERNAME: Joi.string().required(),
  TYPEORM_PASSWORD: Joi.string().required(),
  TYPEORM_DATABASE: Joi.string().required(),
  TYPEORM_LOGGING: Joi.boolean().required(),
  TYPEORM_SYNCHRONIZE: Joi.boolean().required(),
  // configuration db for testing
  TEST_DATABASE_NAME: Joi.string().required(),
});
