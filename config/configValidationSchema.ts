import * as Joi from '@hapi/joi';

export default Joi.object({
  PORT: Joi.number().required(),
  HOST: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
})