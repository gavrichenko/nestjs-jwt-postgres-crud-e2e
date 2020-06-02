import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().required(),
  HOST: Joi.string().required(),
  SECRET_FOR_ACCESS_TOKEN: Joi.string().required(),
  SECRET_FOR_REFRESH_TOKEN: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_LOGGING: Joi.boolean().required(),
});
