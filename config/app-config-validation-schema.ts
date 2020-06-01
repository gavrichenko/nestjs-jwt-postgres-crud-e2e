import * as Joi from '@hapi/joi';

export default Joi.object({
  PORT: Joi.number().required(),
  HOST: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(), // (https://github.com/vercel/ms) Eg: 60, "2 days", "1m", "10h", "7d"
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
});
