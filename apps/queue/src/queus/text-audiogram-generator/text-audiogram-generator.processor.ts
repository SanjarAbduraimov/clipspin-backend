import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { ApifyClient } from 'apify-client'
import { Job } from 'bull'

import {
  ProjectProgress,
  ProjectStatus,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { CreatomateService } from '../../services/creatomate.service'
import { FalAIService } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import { OutputQueue } from '../output/output.queue'
import {
  GenerateTextAudiogramData,
  TEXT_AUDIOGRAM_GENERATOR_QUEUE_EVENTS,
  TEXT_AUDIOGRAM_GENERATOR_QUEUE_NAME,
  TextAudiogramGeneratorQueue,
} from './text-audiogram-generator.queue'

@Processor(TEXT_AUDIOGRAM_GENERATOR_QUEUE_NAME)
export class TextAudiogramGeneratorQueueProcessor {
  client: ApifyClient

  constructor(
    private readonly config_service: ConfigService,
    private readonly project_service: ProjectService,
    private readonly openai_service: OpenAIService,
    private readonly falai_service: FalAIService,
    private readonly creatomate_service: CreatomateService,
    private readonly text_audiogram_generator_queue: TextAudiogramGeneratorQueue,
    private readonly output_queue: OutputQueue,
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

  @Process(TEXT_AUDIOGRAM_GENERATOR_QUEUE_EVENTS.GENERATE_SCRIPT)
  async generate_scenes(job: Job<GenerateTextAudiogramData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.GENERATING_SCRIPT,
      })

      const script = await this.openai_service.generate_script({
        description: project.selected_idea.script,
      })

      await this.project_service.update(project.id, {
        text_audiogram_data: script,
      })

      this.text_audiogram_generator_queue.generate_scene_image({
        project_id: project._id,
      })
    } catch (error) {
      console.log(error)
    }
  }

  @Process(TEXT_AUDIOGRAM_GENERATOR_QUEUE_EVENTS.GENERATE_IMAGE)
  async generate_image(job: Job<GenerateTextAudiogramData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.GENERATING_IMAGES,
      })

      const image = await this.falai_service.generate_image({
        prompt: project.text_audiogram_data.image_prompt,
      })

      await this.project_service.update(project.id, {
        text_audiogram_data: {
          ...project.text_audiogram_data,
          image_url: image.url,
        },
      })

      this.text_audiogram_generator_queue.generate_video({
        project_id: project._id,
      })
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }

  @Process(TEXT_AUDIOGRAM_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO)
  async generate_video(job: Job<GenerateTextAudiogramData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.GENERATING_VIDEO,
      })

      const video_url = await this.creatomate_service.generate_text_audiogram({
        script: project.text_audiogram_data,
      })

      this.output_queue.save({ project_id: project._id, video_url })
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }
}
