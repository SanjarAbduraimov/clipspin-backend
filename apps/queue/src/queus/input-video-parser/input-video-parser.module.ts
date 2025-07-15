import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { R2Service } from 'apps/backend/src/services/r2.service'

import { AnalyzeVideoQueueModule } from '../analyze-video/analyze-video.module'
import { InputVideoParserQueueProcessor } from './input-video-parser.processor'
import {
  INPUT_VIDEO_PARSER_QUEUE_NAME,
  InputVideoParserQueue,
} from './input-video-parser.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: INPUT_VIDEO_PARSER_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 15000,
        },
      },
    }),
    ProjectModule,
    AnalyzeVideoQueueModule,
  ],
  providers: [InputVideoParserQueue, InputVideoParserQueueProcessor, R2Service],
  exports: [InputVideoParserQueue],
})
export class InputVideoParserQueueModule {}
