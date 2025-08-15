import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import {
  ProjectDocument,
  ProjectErrorCause,
  SlideShowScene,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { OpenAIService } from '../../services/openai.service'
import {
  CONTENT_GENERATOR_QUEUE_EVENTS,
  CONTENT_GENERATOR_QUEUE_NAME,
  ContentGeneratorQueueData,
} from './content-generator.queue'

@Processor(CONTENT_GENERATOR_QUEUE_NAME)
export class ContentGeneratorProcessor {
  constructor(
    private readonly project_service: ProjectService,
    private readonly openai_service: OpenAIService,
  ) {}

  @OnQueueActive()
  onActive(job: Job<ContentGeneratorQueueData>) {
    console.log(`processing job "${job.name}" with data: `, job.data)
  }

  @OnQueueFailed()
  onFailed(job: Job<ContentGeneratorQueueData>, error: Error) {
    console.log(`failed job "${job.name}" with data: `, job.data)
    console.error(`Error in job "${job.name}":`, error)
  }

  get_description(project: ProjectDocument) {
    let description = ''

    if (project.selected_idea?.script) {
      description = project.selected_idea.script
    } else if (project.slide_show_data?.scenes?.length) {
      description = project.slide_show_data.scenes
        .map((scene: SlideShowScene) => scene.voiceover_script)
        .join(' ')
    } else if (project.text_audiogram_data?.quote_text) {
      description = project.text_audiogram_data.quote_text
    } else if (project.talking_head_data?.script) {
      description = project.talking_head_data.script
    } else if (project.veo3_data?.script) {
      description = project.veo3_data.script
    } else {
      throw new Error('No content found to generate hashtags from')
    }

    return description
  }

  @Process(CONTENT_GENERATOR_QUEUE_EVENTS.GENERATE_HASHTAGS)
  async generate_hashtags(job: Job<ContentGeneratorQueueData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      const description = this.get_description(project)

      const response = await this.openai_service.generate_hashtags({
        description,
      })

      await this.project_service.update(job.data.project_id, {
        hashtags: response.hashtags,
      })
    } catch (error) {
      console.error(
        `Failed to generate content for project ${job.data.project_id}:`,
        error,
      )
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_CONTENT)
    }
  }

  @Process(CONTENT_GENERATOR_QUEUE_EVENTS.GENERATE_COPY)
  async generate_copy(job: Job<ContentGeneratorQueueData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      const description = this.get_description(project)

      const response = await this.openai_service.generate_optimized_copy({
        description,
      })
      console.log(response)

      await this.project_service.update(job.data.project_id, {
        optimized_copy: response.copy,
      })
    } catch (error) {
      console.error(
        `Failed to generate content for project ${job.data.project_id}:`,
        error,
      )
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_CONTENT)
    }
  }

  @Process(CONTENT_GENERATOR_QUEUE_EVENTS.GENERATE_ALL)
  async generateAll(job: Job<ContentGeneratorQueueData>) {
    this.generate_hashtags(job)
    this.generate_copy(job)
  }
}
