import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { FalAIService } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import { OutputQueueModule } from '../output/output.module'
import { Veo3GeneratorQueueProcessor } from './veo3-generator.processor'
import {
  VEO3_GENERATOR_QUEUE_NAME,
  Veo3GeneratorQueue,
} from './veo3-generator.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: VEO3_GENERATOR_QUEUE_NAME,
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
    Veo3GeneratorQueue,
    Veo3GeneratorQueueProcessor,
  ],
  exports: [Veo3GeneratorQueue],
})
export class Veo3GeneratorQueueModule {}
