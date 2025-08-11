import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { OpenAIService } from '../../services/openai.service'
import { ContentGeneratorProcessor } from './content-generator.processor'
import {
  CONTENT_GENERATOR_QUEUE_NAME,
  ContentGeneratorQueue,
} from './content-generator.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: CONTENT_GENERATOR_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 15000,
        },
      },
    }),
  ],
  providers: [OpenAIService, ContentGeneratorQueue, ContentGeneratorProcessor],
  exports: [ContentGeneratorQueue],
})
export class ContentGeneratorQueueModule {}
