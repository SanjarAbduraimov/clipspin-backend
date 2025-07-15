import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import {
  ProjectErrorCause,
  ProjectType,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { InputVideoParserQueue } from '../input-video-parser/input-video-parser.queue'
import { OutputQueue, OutputQueueData } from '../output/output.queue'
import { SlideGeneratorQueue } from '../slide-show-generator/slide-show-generator.queue'
import { TalkingHeadGeneratorQueue } from '../talking-head-generator/talking-head-generator.queue'
import { TextAudiogramGeneratorQueue } from '../text-audiogram-generator/text-audiogram-generator.queue'
import {
  MAIN_QUEUE_EVENTS,
  MAIN_QUEUE_NAME,
  MainQueueData,
} from './main-queue.queue'

@Processor(MAIN_QUEUE_NAME)
export class MainQueueProcessor {
  constructor(
    private readonly input_video_parser_queue: InputVideoParserQueue,
    private readonly slide_generator_queue: SlideGeneratorQueue,
    private readonly project_service: ProjectService,
    private readonly text_audiogram_generator_queue: TextAudiogramGeneratorQueue,
    private readonly talking_head_generator_queue: TalkingHeadGeneratorQueue,
    private readonly output_queue: OutputQueue,
    private readonly test_queue: TalkingHeadGeneratorQueue,
  ) {}

  @OnQueueActive()
  onActive(job: Job<MainQueueData>) {
    console.log(`processing job "${job.name}" with data: `, job.data)
  }

  @OnQueueFailed()
  onFailed(job: Job<MainQueueData>, error: Error) {
    console.log(`failed job "${job.name}" with data: `, job.data)
    console.error(`Error in job "${job.name}":`, error)

    if (job.attemptsMade == job.opts.attempts) {
      const message = error.message
      this.project_service.failed(job.data.project_id, message)
    }
  }

  @Process(MAIN_QUEUE_EVENTS.PROCESS)
  async analyze(job: Job<MainQueueData>) {
    this.input_video_parser_queue.download_video({
      project_id: job.data.project_id,
    })
  }

  @Process(MAIN_QUEUE_EVENTS.GENERATE)
  async generate(job: Job<MainQueueData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      switch (project.type) {
        case ProjectType.SLIDE_SHOW:
          this.slide_generator_queue.generate({
            project_id: project.id,
          })
          break

        case ProjectType.TEXT_AUDIOGRAM:
          this.text_audiogram_generator_queue.generate({
            project_id: project.id,
          })
          break

        case ProjectType.TALKING_HEAD:
          this.talking_head_generator_queue.generate({
            project_id: project.id,
          })
          break

        default:
          break
      }
    } catch (error) {
      new Error(ProjectErrorCause.FAILED_TO_GENERATE_VIDEO)
    }
  }

  @Process(MAIN_QUEUE_EVENTS.OUTPUT)
  async output(job: Job<OutputQueueData>) {
    this.output_queue.save(job.data)
  }
}
