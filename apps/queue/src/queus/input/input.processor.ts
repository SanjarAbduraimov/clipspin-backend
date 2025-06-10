import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import {
  ProjectStatus,
  ProjectType,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { InstagramParserQueue } from '../instagram-parser/instagram-parser.queue'
import { SlideGeneratorQueue } from '../slide-show-generator/slide-show-generator.queue'
import { TalkingHeadGeneratorQueue } from '../talking-head-generator/talking-head-generator.queue'
import { TextAudiogramGeneratorQueue } from '../text-audiogram-generator/text-audiogram-generator.queue'
import {
  INPUT_QUEUE_EVENTS,
  INPUT_QUEUE_NAME,
  InputQueueData,
} from './input.queue'

@Processor(INPUT_QUEUE_NAME)
export class InputQueueProcessor {
  constructor(
    private readonly instagram_parser_queue: InstagramParserQueue,
    private readonly slide_generator_queue: SlideGeneratorQueue,
    private readonly project_service: ProjectService,
    private readonly text_audiogram_generator_queue: TextAudiogramGeneratorQueue,
    private readonly talking_head_generator_queue: TalkingHeadGeneratorQueue,
    private readonly test_queue: TalkingHeadGeneratorQueue,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data: `,
      job.data,
    )
  }

  @Process(INPUT_QUEUE_EVENTS.PROCESS)
  async analyze(job: Job<InputQueueData>) {
    this.instagram_parser_queue.download_video({
      project_id: job.data.project_id,
    })
  }

  @Process(INPUT_QUEUE_EVENTS.GENERATE)
  async generate(job: Job<InputQueueData>) {
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
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }

  @Process(INPUT_QUEUE_EVENTS.TEST)
  async test(job: Job<InputQueueData>) {
    this.test_queue.generate_video({
      project_id: job.data.project_id,
    })
  }
}
