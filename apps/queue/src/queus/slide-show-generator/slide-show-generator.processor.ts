import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { ApifyClient } from 'apify-client'
import { Job } from 'bull'

import {
  ProjectProgress,
  ProjectStatus,
  Scene,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { CreatomateService } from '../../services/creatomate.service'
import { FalAIService } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import {
  GenerateSlidesData,
  SLIDE_GENERATOR_QUEUE_EVENTS,
  SLIDE_GENERATOR_QUEUE_NAME,
  SlideGeneratorQueue,
} from './slide-show-generator.queue'

@Processor(SLIDE_GENERATOR_QUEUE_NAME)
export class SlideGeneratorQueueProcessor {
  client: ApifyClient

  constructor(
    private readonly config_service: ConfigService,
    private readonly project_service: ProjectService,
    private readonly openai_service: OpenAIService,
    private readonly falai_service: FalAIService,
    private readonly creatomate_service: CreatomateService,
    private readonly slide_generator_queue: SlideGeneratorQueue,
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

  @Process(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_SCENES)
  async generate_scenes(job: Job<GenerateSlidesData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.GENERATING_SCRIPT,
      })

      const scenes = await this.openai_service.generate_scenes({
        description: project.input_summary,
      })

      await this.project_service.update(project.id, {
        scenes: scenes.filter(
          (item) => item.image_prompt && item.voiceover_script,
        ),
      })

      this.slide_generator_queue.generate_scene_images({
        project_id: project._id,
      })
    } catch (error) {
      console.log(error)
    }
  }

  @Process(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_SCENE_IMAGE)
  async generate_slides(job: Job<GenerateSlidesData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.GENERATING_IMAGES,
      })

      const scenes: Scene[] = []

      for (const scene of project.scenes) {
        const image = await this.falai_service.generate_image({
          prompt: scene.image_prompt,
        })

        scenes.push({
          ...scene,
          image_url: image.url,
        })
      }

      await this.project_service.update(project.id, {
        scenes,
      })

      this.slide_generator_queue.generate_video({
        project_id: project._id,
      })
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }

  @Process(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO)
  async generate_video(job: Job<GenerateSlidesData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.GENERATING_VIDEO,
      })

      const video_url = await this.creatomate_service.generate_slide_show({
        scenes: project.scenes,
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
