import { NestFactory } from '@nestjs/core'

import { ConsumersModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(ConsumersModule)

  await app.init()
}
bootstrap()
