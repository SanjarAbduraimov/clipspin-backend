import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import fs from 'fs'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { GenAIService } from 'apps/backend/src/services/genai.service'

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

      const file = await fs.promises.readFile(project.file_url)

      const file_context = await this.genai_service.upload_file(file)

      this.analyze_video_queue.analyze_video({
        project_id: project.id,
        file_name: file_context.name,
      })
    } catch (error) {
      console.log(error)
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
        input_summary: analysis.text,
      })
    } catch (error) {
      console.log(error)
    }
  }
}
