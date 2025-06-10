import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { R2Service } from 'apps/backend/src/services/r2.service'

import { GenAIService } from '../../services/genai.service'
import { AnalyzeVideoQueueProcessor } from './analyze-video.processor'
import {
  ANALYZE_VIDEO_QUEUE_NAME,
  AnalyzeVideoQueue,
} from './analyze-video.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: ANALYZE_VIDEO_QUEUE_NAME,
    }),
    ProjectModule,
  ],
  providers: [
    GenAIService,
    R2Service,
    AnalyzeVideoQueue,
    AnalyzeVideoQueueProcessor,
  ],
  exports: [AnalyzeVideoQueue],
})
export class AnalyzeVideoQueueModule {}
