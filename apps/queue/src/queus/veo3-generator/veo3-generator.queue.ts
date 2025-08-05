import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const VEO3_GENERATOR_QUEUE_NAME = 'veo3-generator-queue'

export enum VEO3_GENERATOR_QUEUE_EVENTS {
  GENERATE_SCRIPT = 'generate_script',
  GENERATE_VIDEO = 'generate_video',
}

export interface GenerateVeo3Data {
  project_id: Types.ObjectId
}

@Injectable()
export class Veo3GeneratorQueue {
  constructor(@InjectQueue(VEO3_GENERATOR_QUEUE_NAME) private queue: Queue) {}

  generate(data: GenerateVeo3Data) {
    this.queue.add(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_SCRIPT, data)
  }

  generate_video(data: GenerateVeo3Data) {
    this.queue.add(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO, data)
  }
}
