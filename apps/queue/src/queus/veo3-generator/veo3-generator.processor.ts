import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { ProjectProgress } from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { FalAIService } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import { OutputQueue } from '../output/output.queue'
import {
  GenerateVeo3Data,
  VEO3_GENERATOR_QUEUE_EVENTS,
  VEO3_GENERATOR_QUEUE_NAME,
  Veo3GeneratorQueue,
} from './veo3-generator.queue'

@Processor(VEO3_GENERATOR_QUEUE_NAME)
export class Veo3GeneratorQueueProcessor {
  constructor(
    private readonly project_service: ProjectService,
    private readonly openai_service: OpenAIService,
    private readonly falai_service: FalAIService,
    private readonly output_queue: OutputQueue,
    private readonly veo3_generator_queue: Veo3GeneratorQueue,
  ) {}

  @OnQueueActive()
  onActive(job: Job<GenerateVeo3Data>) {
    console.log(`processing job "${job.name}" with data: `, job.data)
  }

  @OnQueueFailed()
  onFailed(job: Job<GenerateVeo3Data>, error: Error) {
    console.log(`failed job "${job.name}" with data: `, job.data)
    console.error(`Error in job "${job.name}":`, error)

    if (job.attemptsMade == job.opts.attempts) {
      const message = error.message
      this.project_service.failed(job.data.project_id, message)
    }
  }

  @Process(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_SCRIPT)
  async generate_scenes(job: Job<GenerateVeo3Data>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_SCRIPT,
    })

    const script = await this.openai_service.generate_veo3_script({
      description: project.selected_idea.script,
    })

    await this.project_service.update(project.id, {
      veo3_data: script,
    })

    this.veo3_generator_queue.generate_video({
      project_id: project._id,
    })
  }

  @Process(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO)
  async generate_video(job: Job<GenerateVeo3Data>) {
    const project = await this.project_service.retrieve(job.data.project_id)
    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_VIDEO,
    })
    const video = await this.falai_service.generate_video({
      prompt: project.veo3_data.script,
    })
    await this.project_service.update(job.data.project_id, {
      progress: ProjectProgress.VIDEO_GENERATED,
    })

    this.output_queue.save({ project_id: project._id, video_url: video.url })
  }
}
