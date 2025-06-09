import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { ApifyClient } from 'apify-client'
import { Job } from 'bull'

import {
  ProjectProgress,
  ProjectStatus,
} from 'apps/backend/src/models/project.schema'

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
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data: `,
      job.data,
    )
  }

  @Process(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_SCRIPT)
  async generate_scenes(job: Job<GenerateTalkingHeadData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.GENERATING_SCRIPT,
      })

      const script = await this.openai_service.generate_talking_head_script({
        description: project.input_summary,
      })

      await this.project_service.update(project.id, {
        script,
      })

      this.talking_head_generator_queue.generate_video({
        project_id: project._id,
      })
    } catch (error) {
      console.log(error)
    }
  }

  @Process(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO)
  async generate_video(job: Job<GenerateTalkingHeadData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.GENERATING_VIDEO,
      })

      const video_url = await this.heygen_service.generate_video({
        script: project.script,
        title: project.title,
      })

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.COMPLETED,
        result: {
          video_url,
        },
      })
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }
}
