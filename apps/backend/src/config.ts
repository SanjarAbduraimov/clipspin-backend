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
  REDIS_URL: Joi.string().required(),
  APIFY_TOKEN: Joi.string().required(),
  OPEN_AI_API_KEY: Joi.string().required(),
  FAL_AI_API_KEY: Joi.string().required(),
  CREATOMATE_API_KEY: Joi.string().required(),
  CREATOMATE_SLIDE_SHOW_TEMPLATE_ID: Joi.string().required(),
  CREATOMATE_TEXT_AUDIOGRAM_TEMPLATE_ID: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_OAUTH_CALLBACK_URL: Joi.string().required(),
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
    url: process.env.REDIS_URL,
  },
  apify: {
    token: process.env.APIFY_TOKEN,
  },
  google: {
    genai_api_key: process.env.GOOGLE_GEN_AI_API_KEY,

    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    callback_url: process.env.GOOGLE_OAUTH_CALLBACK_URL,
  },
  openai: {
    api_key: process.env.OPEN_AI_API_KEY,
  },
  falai: {
    api_key: process.env.FAL_AI_API_KEY,
  },
  creatomate: {
    api_key: process.env.CREATOMATE_API_KEY,
    slide_show_template_id: process.env.CREATOMATE_SLIDE_SHOW_TEMPLATE_ID,
    text_audiogram_template_id:
      process.env.CREATOMATE_TEXT_AUDIOGRAM_TEMPLATE_ID,
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
