import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { ApifyClient } from 'apify-client'
import { Job } from 'bull'

import { HeygenAvatarDocument } from 'apps/backend/src/models/heygen-avatar.schema'
import {
  ProjectProgress,
  SlideShowScene,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { createHeygenVariablesFromTalkingHead } from '../../models/talking-head.interface'
import { FalAIService } from '../../services/falai.service'
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
    private readonly falai_service: FalAIService,
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
    console.error(`Error in job "${job.name}":`, error)

    if (job.attemptsMade == job.opts.attempts) {
      const message = error.message
      this.project_service.failed(job.data.project_id, message)
    }
  }

  @Process(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_SCENES)
  async generate_scenes(job: Job<GenerateTalkingHeadData>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_SCRIPT,
    })

    const scenes = await this.openai_service.generate_scenes({
      description: project.selected_idea.script,
    })

    await this.project_service.update(project.id, {
      talking_head_data: {
        scenes: scenes.filter(
          (item) => item.image_prompt && item.voiceover_script,
        ),
      },
      progress: ProjectProgress.SCRIPT_GENERATED,
    })

    this.talking_head_generator_queue.generate_scene_images({
      project_id: project._id,
    })
  }

  @Process(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_SCENE_IMAGE)
  async generate_images(job: Job<GenerateTalkingHeadData>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_IMAGES,
    })

    const scenes: SlideShowScene[] = []

    for (const scene of project.talking_head_data.scenes) {
      const image = await this.falai_service.generate_image({
        prompt: scene.image_prompt,
      })

      scenes.push({
        ...scene,
        image_url: image.url,
      })
    }

    await this.project_service.update(project.id, {
      talking_head_data: { scenes },
      progress: ProjectProgress.IMAGES_GENERATED,
    })

    this.talking_head_generator_queue.generate_video({
      project_id: project._id,
    })
  }

  @Process(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO)
  async generate_video(job: Job<GenerateTalkingHeadData>) {
    const project = await this.project_service.retrieve(job.data.project_id, {
      populate: 'avatar',
    })

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_VIDEO,
    })

    const avatar = project.avatar as unknown as HeygenAvatarDocument

    const variables = createHeygenVariablesFromTalkingHead(
      project.talking_head_data,
      avatar.default_voice_id,
      avatar.avatar_id,
    )

    const video = await this.heygen_service.generate_video({
      title: project.title,
      callback_id: project._id.toString(),
      variables,
    })

    await this.project_service.update(job.data.project_id, {
      output: {
        video_id: video.data.video_id,
      },
    })
  }
}
