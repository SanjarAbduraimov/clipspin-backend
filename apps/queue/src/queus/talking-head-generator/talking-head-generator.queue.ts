import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const TALKING_HEAD_GENERATOR_QUEUE_NAME = 'talking-head-generator-queue'

export enum TALKING_HEAD_GENERATOR_QUEUE_EVENTS {
  GENERATE_SCRIPT = 'generate_script',
  GENERATE_VIDEO = 'generate_video',
}

export interface GenerateTalkingHeadData {
  project_id: Types.ObjectId
}

@Injectable()
export class TalkingHeadGeneratorQueue {
  constructor(
    @InjectQueue(TALKING_HEAD_GENERATOR_QUEUE_NAME) private queue: Queue,
  ) {}

  generate(data: GenerateTalkingHeadData) {
    this.queue.add(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_SCRIPT, data)
  }

  generate_video(data: GenerateTalkingHeadData) {
    this.queue.add(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO, data)
  }
}
