import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { InstagramParserQueue } from '../instagram-parser/instagram-parser.queue'
import { SlideGeneratorQueue } from '../slide-show-generator/slide-show-generator.queue'
import {
  INPUT_QUEUE_EVENTS,
  INPUT_QUEUE_NAME,
  InputQueueData,
} from './input.queue'

@Processor(INPUT_QUEUE_NAME)
export class InputQueueProcessor {
  constructor(
    private readonly instagram_parser_queue: InstagramParserQueue,
    private readonly test_queue: SlideGeneratorQueue,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data: `,
      job.data,
    )
  }

  @Process(INPUT_QUEUE_EVENTS.PROCESS)
  async process(job: Job<InputQueueData>) {
    this.instagram_parser_queue.download_video({
      project_id: job.data.project_id,
    })
  }

  @Process(INPUT_QUEUE_EVENTS.TEST)
  async test(job: Job<InputQueueData>) {
    this.test_queue.generate_video({
      project_id: job.data.project_id,
    })
  }
}
