import Joi from 'joi'

export const validation_schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_URI: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  DOCS_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  APIFY_TOKEN: Joi.string().required(),
  OPEN_AI_API_KEY: Joi.string().required(),
  FAL_AI_API_KEY: Joi.string().required(),
  CREATOMATE_API_KEY: Joi.string().required(),
  CREATOMATE_TEMPLATE_ID: Joi.string().required(),
})

export const configuration = () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  database: {
    uri: process.env.DATABASE_URI,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  jwt_secret: process.env.JWT_SECRET,
  docs_password: process.env.DOCS_PASSWORD,
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  apify: {
    token: process.env.APIFY_TOKEN,
  },
  google: {
    genai_api_key: process.env.GOOGLE_GEN_AI_API_KEY,
  },
  openai: {
    api_key: process.env.OPEN_AI_API_KEY,
  },
  falai: {
    api_key: process.env.FAL_AI_API_KEY,
  },
  creatomate: {
    api_key: process.env.CREATOMATE_API_KEY,
    template_id: process.env.CREATOMATE_TEMPLATE_ID,
  },
})

export default {
  isGlobal: true,
  load: [configuration],
  validationSchema: validation_schema,
  validationOptions: {
    abortEarly: true,
  },
}
