import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { CreatomateService } from '../../services/creatomate.service'
import { FalAIService } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import { OutputQueueModule } from '../output/output.module'
import { SlideGeneratorQueueProcessor } from './slide-show-generator.processor'
import {
  SLIDE_GENERATOR_QUEUE_NAME,
  SlideGeneratorQueue,
} from './slide-show-generator.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: SLIDE_GENERATOR_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 15000,
        },
      },
    }),
    ProjectModule,
    OutputQueueModule,
  ],
  providers: [
    OpenAIService,
    FalAIService,
    CreatomateService,
    SlideGeneratorQueue,
    SlideGeneratorQueueProcessor,
  ],
  exports: [SlideGeneratorQueue],
})
export class SlideGeneratorQueueModule {}
