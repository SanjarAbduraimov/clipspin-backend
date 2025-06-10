import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { CreatomateService } from '../../services/creatomate.service'
import { FalAIService } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import { OutputQueueModule } from '../output/output.module'
import { TextAudiogramGeneratorQueueProcessor } from './text-audiogram-generator.processor'
import {
  TEXT_AUDIOGRAM_GENERATOR_QUEUE_NAME,
  TextAudiogramGeneratorQueue,
} from './text-audiogram-generator.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: TEXT_AUDIOGRAM_GENERATOR_QUEUE_NAME,
    }),
    ProjectModule,
    OutputQueueModule,
  ],
  providers: [
    OpenAIService,
    FalAIService,
    CreatomateService,
    TextAudiogramGeneratorQueue,
    TextAudiogramGeneratorQueueProcessor,
  ],
  exports: [TextAudiogramGeneratorQueue],
})
export class TextAudiogramGeneratorQueueModule {}
