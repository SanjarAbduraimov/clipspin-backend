import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ProjectModule } from 'apps/backend/src/api/projects/project.module'

import { GenAIService } from '../../services/genai.service'
import { SlideGeneratorQueueModule } from '../slide-show-generator/slide-show-generator.module'
import { TalkingHeadGeneratorQueueModule } from '../talking-head-generator/talking-head-generator.module'
import { TextAudiogramGeneratorQueueModule } from '../text-audiogram-generator/text-audiogram-generator.module'
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
    SlideGeneratorQueueModule,
    TextAudiogramGeneratorQueueModule,
    TalkingHeadGeneratorQueueModule,
  ],
  providers: [GenAIService, AnalyzeVideoQueue, AnalyzeVideoQueueProcessor],
  exports: [AnalyzeVideoQueue],
})
export class AnalyzeVideoQueueModule {}
