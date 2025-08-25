import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import {
  ProjectErrorCause,
  ProjectProgress,
  Veo3Scene,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { FalAIService, Keyframe } from '../../services/falai.service'
import { OpenAIService } from '../../services/openai.service'
import { OutputQueue } from '../output/output.queue'
import {
  GenerateSingleVeo3Data,
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

  @Process(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_SCENES)
  async generate_scenes(job: Job<GenerateVeo3Data>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_SCRIPT,
    })

    const veo3_elements = await this.openai_service.generate_veo3_elements({
      description: project.selected_idea.script,
    })
    if (!veo3_elements?.length) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_SCENES)
    }
    const scenes: Veo3Scene[] = (
      await Promise.all(
        veo3_elements.map(async (item, index) => {
          const is_valid =
            item.elementA &&
            item.elementB &&
            item.elementC &&
            item.elementD &&
            item.elementE

          if (!is_valid) return null

          const scene = await this.openai_service.generate_veo3_scenes(item)
          return {
            scene_number: index + 1,
            success: false,
            video_prompt: scene.video_prompt,
          } as Veo3Scene
        }),
      )
    ).filter((scene): scene is Veo3Scene => !!scene)

    if (!scenes.length) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_SCENES)
    }

    await this.project_service.update(project.id, {
      veo3_data: {
        scenes,
      },
      progress: ProjectProgress.SCRIPT_GENERATED,
    })

    this.veo3_generator_queue.generate_scene_videos({
      project_id: project._id,
    })
  }

  @Process(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_SCENE_VIDEOS)
  async generate_videos(job: Job<GenerateVeo3Data>) {
    const project = await this.project_service.retrieve(job.data.project_id)

    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_VEO3,
    })
    for (const scene of project.veo3_data.scenes) {
      this.veo3_generator_queue.generate_veo3_video({
        project_id: project._id,
        scene_number: scene.scene_number,
        prompt: scene.video_prompt,
      })
    }
  }

  @Process(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_VEO3_VIDEO)
  async generate_veo3_video(job: Job<GenerateSingleVeo3Data>) {
    const project = await this.project_service.retrieve(job.data.project_id)
    if (
      project.error_cause === ProjectErrorCause.FAILED_TO_GENERATE_VEO3_VIDEO
    ) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VEO3_VIDEO)
    }

    const scene_index = project.veo3_data.scenes.findIndex(
      (item) => item.scene_number === job.data.scene_number,
    )

    if (scene_index === -1) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VIDEO)
    }
    const scene = project.veo3_data.scenes[scene_index]

    let video_url = scene.video_url
    if (!video_url) {
      const video = await this.falai_service.generate_veo3_video({
        prompt: scene.video_prompt,
      })
      video_url = video.url
    }

    await this.project_service.updateOne(
      {
        _id: project._id,
        'veo3_data.scenes.scene_number': job.data.scene_number,
      },
      {
        'veo3_data.scenes.$.video_url': video_url,
        'veo3_data.scenes.$.success': true,
        progress: ProjectProgress.GENERATING_VEO3,
      },
    )

    const updated_project = await this.project_service.retrieve(project._id)

    const all_success = updated_project.veo3_data.scenes.every((s) => s.success)

    if (all_success) {
      this.veo3_generator_queue.compose_video({
        project_id: project._id,
      })

      await this.project_service.update(project._id, {
        progress: ProjectProgress.VEO3_GENERATED,
      })
    }
  }

  @Process(VEO3_GENERATOR_QUEUE_EVENTS.COMPOSE_VIDEO)
  async compose_video(job: Job<GenerateVeo3Data>) {
    const project = await this.project_service.retrieve(job.data.project_id)
    await this.project_service.update(project._id, {
      progress: ProjectProgress.GENERATING_VIDEO,
    })

    const default_duration_sec = 8
    const keyframes: Keyframe[] = []
    let current_timestamp = 0

    for (const scene of project.veo3_data.scenes) {
      const duration = default_duration_sec
      if (scene.video_url) {
        keyframes.push({
          url: scene.video_url,
          timestamp: current_timestamp,
          duration,
        })
        current_timestamp += duration
      }
    }

    if (keyframes.length === 0) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VIDEO)
    }

    const video = await this.falai_service.compose_video({
      id: project._id.toString(),
      keyframes,
    })
    await this.project_service.update(job.data.project_id, {
      progress: ProjectProgress.VIDEO_GENERATED,
    })

    this.output_queue.save({
      project_id: project._id,
      video_url: video.video_url.toString(),
    })
  }
}
