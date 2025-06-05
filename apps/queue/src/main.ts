import { NestFactory } from '@nestjs/core'

import { ConsumersModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(ConsumersModule, {
    logger: ['error', 'warn', 'log'],
  })

  await app.init()
}
bootstrap()
