import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { Readable } from 'stream'

import {
  ProjectProgress,
  ProjectStatus,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { R2Service } from 'apps/backend/src/services/r2.service'

import { GenAIService } from '../../services/genai.service'
import {
  ANALYZE_VIDEO_QUEUE_EVENTS,
  ANALYZE_VIDEO_QUEUE_NAME,
  AnalyzeVideoData,
  AnalyzeVideoQueue,
  UploadVideoData,
} from './analyze-video.queue'

@Processor(ANALYZE_VIDEO_QUEUE_NAME)
export class AnalyzeVideoQueueProcessor {
  constructor(
    private readonly project_service: ProjectService,
    private readonly genai_service: GenAIService,
    private readonly r2_service: R2Service,
    private readonly analyze_video_queue: AnalyzeVideoQueue,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data: `,
      job.data,
    )
  }

  @Process(ANALYZE_VIDEO_QUEUE_EVENTS.UPLOAD_VIDEO)
  async upload(job: Job<UploadVideoData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.ANALYZING_INPUT,
      })

      const file = await this.r2_service.get_file(project.input.file_key)

      const buffer = await this.r2_service.stream_to_buffer(
        file.Body as Readable,
      )

      const file_context = await this.genai_service.upload_file(buffer)

      this.analyze_video_queue.analyze_video({
        project_id: project.id,
        file_name: file_context.name,
      })
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }

  @Process(ANALYZE_VIDEO_QUEUE_EVENTS.ANALYZE_VIDEO)
  async analyze(job: Job<AnalyzeVideoData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      const file_context = await this.genai_service.wait_file_to_process(
        job.data.file_name,
      )

      const analysis = await this.genai_service.analyze_video(file_context)

      await this.project_service.update(project.id, {
        suggested_ideas: analysis,
        progress: ProjectProgress.INPUT_ANALYZED,
      })
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }

  @Process(ANALYZE_VIDEO_QUEUE_EVENTS.ANALYZE_YOUTUBE_VIDEO)
  async analyze_youtube(job: Job<AnalyzeVideoData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      const analysis = await this.genai_service.analyze_youtube_video(
        project.input.url,
      )

      await this.project_service.update(project.id, {
        suggested_ideas: analysis,
        progress: ProjectProgress.INPUT_ANALYZED,
      })
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }
}
