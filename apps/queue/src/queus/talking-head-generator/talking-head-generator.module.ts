import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { HeygenService } from '../../services/haygen.service'
import { OpenAIService } from '../../services/openai.service'
import { TalkingHeadGeneratorQueueProcessor } from './talking-head-generator.processor'
import {
  TALKING_HEAD_GENERATOR_QUEUE_NAME,
  TalkingHeadGeneratorQueue,
} from './talking-head-generator.queue'
import { FalAIService } from '../../services/falai.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: TALKING_HEAD_GENERATOR_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 15000,
        },
      },
    }),
    ProjectModule,
  ],
  providers: [
    OpenAIService,
    HeygenService,
    FalAIService,
    TalkingHeadGeneratorQueue,
    TalkingHeadGeneratorQueueProcessor,
  ],
  exports: [TalkingHeadGeneratorQueue],
})
export class TalkingHeadGeneratorQueueModule {}
