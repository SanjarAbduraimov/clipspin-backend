import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { ApifyClient } from 'apify-client'
import { Job } from 'bull'

import {
  ProjectProgress,
  SlideShowScene,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { CreatomateService } from '../../services/creatomate.service'
import { FalAIService } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import { OutputQueue } from '../output/output.queue'
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
    private readonly output_queue: OutputQueue,
  ) {
    const token = this.config_service.get('apify.token')

    this.client = new ApifyClient({
      token,
    })
  }

  @OnQueueActive()
  onActive(job: Job<GenerateSlidesData>) {
    console.log(`processing job "${job.name}" with data: `, job.data)
  }

  @OnQueueFailed()
  onFailed(job: Job<GenerateSlidesData>, error: Error) {
    console.log(`failed job "${job.name}" with data: `, job.data)

    if (job.attemptsMade == job.opts.attempts) {
      const message = error.message
      this.project_service.failed(job.data.project_id, message)
    }
  }

  @Process(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_SCENES)
  async generate_scenes(job: Job<GenerateSlidesData>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_SCRIPT,
    })

    const scenes = await this.openai_service.generate_scenes({
      description: project.selected_idea.script,
    })

    await this.project_service.update(project.id, {
      slide_show_data: {
        scenes: scenes.filter(
          (item) => item.image_prompt && item.voiceover_script,
        ),
      },
      progress: ProjectProgress.SCRIPT_GENERATED,
    })

    this.slide_generator_queue.generate_scene_images({
      project_id: project._id,
    })
  }

  @Process(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_SCENE_IMAGE)
  async generate_slides(job: Job<GenerateSlidesData>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_IMAGES,
    })

    const scenes: SlideShowScene[] = []

    for (const scene of project.slide_show_data.scenes) {
      const image = await this.falai_service.generate_image({
        prompt: scene.image_prompt,
      })

      scenes.push({
        ...scene,
        image_url: image.url,
      })
    }

    await this.project_service.update(project.id, {
      slide_show_data: { scenes },
      progress: ProjectProgress.IMAGES_GENERATED,
    })

    this.slide_generator_queue.generate_video({
      project_id: project._id,
    })
  }

  @Process(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO)
  async generate_video(job: Job<GenerateSlidesData>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_VIDEO,
    })

    const video_url = await this.creatomate_service.generate_slide_show({
      scenes: project.slide_show_data.scenes,
    })

    await this.project_service.update(project._id, {
      progress: ProjectProgress.VIDEO_GENERATED,
    })

    this.output_queue.save({ project_id: project._id, video_url })
  }
}
