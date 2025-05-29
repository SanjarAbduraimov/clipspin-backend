import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { AnalyzeVideoQueueModule } from '../analyze-video/analyze-video.module'
import { InstagramParserQueueProcessor } from './instagram-parser.processor'
import {
  INSTAGRAM_PARSER_QUEUE_NAME,
  InstagramParserQueue,
} from './instagram-parser.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: INSTAGRAM_PARSER_QUEUE_NAME,
    }),
    ProjectModule,
    AnalyzeVideoQueueModule,
  ],
  providers: [InstagramParserQueue, InstagramParserQueueProcessor],
  exports: [InstagramParserQueue],
})
export class InstagramParserQueueModule {}
