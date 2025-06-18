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
  HEYGEN_API_KEY: Joi.string().required(),
  HEYGEN_CALLBACK_URL: Joi.string().required(),
  R2_ACCESS_KEY_ID: Joi.string().required(),
  R2_ACCESS_KEY_SECRET: Joi.string().required(),
  R2_ENDPOINT: Joi.string().required(),
  R2_BUCKET_NAME: Joi.string().required(),
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_SUCCESS_URL: Joi.string().required(),
  STRIPE_CANCEL_URL: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  STRIPE_CREDIT_PRICE_ID: Joi.string().required(),
})

export const configuration = () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  frontend_url: parseInt(process.env.FRONTEND_URL, 10),
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
  heygen: {
    api_key: process.env.HEYGEN_API_KEY,
    callback_url: process.env.HEYGEN_CALLBACK_URL,
  },
  r2: {
    access_key_id: process.env.R2_ACCESS_KEY_ID,
    access_key_secret: process.env.R2_ACCESS_KEY_SECRET,
    endpoint: process.env.R2_ENDPOINT,
    bucket_name: process.env.R2_BUCKET_NAME,
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    credit_price_id: process.env.STRIPE_CREDIT_PRICE_ID,
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
