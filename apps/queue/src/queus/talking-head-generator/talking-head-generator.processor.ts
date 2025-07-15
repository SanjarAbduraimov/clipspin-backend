import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { ApifyClient } from 'apify-client'
import { Job } from 'bull'

import { ProjectProgress } from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { HeygenService } from '../../services/haygen.service'
import { OpenAIService } from '../../services/openai.service'
import {
  GenerateTalkingHeadData,
  TALKING_HEAD_GENERATOR_QUEUE_EVENTS,
  TALKING_HEAD_GENERATOR_QUEUE_NAME,
  TalkingHeadGeneratorQueue,
} from './talking-head-generator.queue'

@Processor(TALKING_HEAD_GENERATOR_QUEUE_NAME)
export class TalkingHeadGeneratorQueueProcessor {
  client: ApifyClient

  constructor(
    private readonly config_service: ConfigService,
    private readonly project_service: ProjectService,
    private readonly openai_service: OpenAIService,
    private readonly heygen_service: HeygenService,
    private readonly talking_head_generator_queue: TalkingHeadGeneratorQueue,
  ) {
    const token = this.config_service.get('apify.token')

    this.client = new ApifyClient({
      token,
    })
  }

  @OnQueueActive()
  onActive(job: Job<GenerateTalkingHeadData>) {
    console.log(`processing job "${job.name}" with data: `, job.data)
  }

  @OnQueueFailed()
  onFailed(job: Job<GenerateTalkingHeadData>, error: Error) {
    console.log(`failed job "${job.name}" with data: `, job.data)

    if (job.attemptsMade == job.opts.attempts) {
      const message = error.message
      this.project_service.failed(job.data.project_id, message)
    }
  }

  @Process(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_SCRIPT)
  async generate_scenes(job: Job<GenerateTalkingHeadData>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_SCRIPT,
    })

    const script = await this.openai_service.generate_talking_head_script({
      description: project.selected_idea.script,
    })

    await this.project_service.update(project.id, {
      talking_head_data: script,
    })

    this.talking_head_generator_queue.generate_video({
      project_id: project._id,
    })
  }

  @Process(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO)
  async generate_video(job: Job<GenerateTalkingHeadData>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_VIDEO,
    })

    const video = await this.heygen_service.generate_video({
      script: project.talking_head_data.script,
      title: project.talking_head_data.title,
      callback_id: project._id.toString(),
    })

    await this.project_service.update(job.data.project_id, {
      output: {
        video_id: video.data.video_id,
      },
    })
  }
}
