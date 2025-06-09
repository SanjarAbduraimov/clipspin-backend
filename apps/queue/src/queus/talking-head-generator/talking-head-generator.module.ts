import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { CreatomateService } from '../../services/creatomate.service'
import { FalAIService } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import { TalkingHeadGeneratorQueueProcessor } from './talking-head-generator.processor'
import {
  TALKING_HEAD_GENERATOR_QUEUE_NAME,
  TalkingHeadGeneratorQueue,
} from './talking-head-generator.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: TALKING_HEAD_GENERATOR_QUEUE_NAME,
    }),
    ProjectModule,
  ],
  providers: [
    OpenAIService,
    FalAIService,
    CreatomateService,
    TalkingHeadGeneratorQueue,
    TalkingHeadGeneratorQueueProcessor,
  ],
  exports: [TalkingHeadGeneratorQueue],
})
export class TalkingHeadGeneratorQueueModule {}
