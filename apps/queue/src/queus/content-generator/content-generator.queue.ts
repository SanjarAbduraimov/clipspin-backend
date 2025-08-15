import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const CONTENT_GENERATOR_QUEUE_NAME = 'content-generator'

export enum CONTENT_GENERATOR_QUEUE_EVENTS {
  GENERATE_HASHTAGS = 'generate_hashtags',
  GENERATE_COPY = 'generate_copy',
  GENERATE_ALL = 'generate_all',
}

export interface ContentGeneratorQueueData {
  project_id: Types.ObjectId
  content_type?: 'hashtags' | 'copy' | 'all'
}

@Injectable()
export class ContentGeneratorQueue {
  constructor(
    @InjectQueue(CONTENT_GENERATOR_QUEUE_NAME) private queue: Queue,
  ) {}

  generate_hashtags(data: ContentGeneratorQueueData) {
    this.queue.add(CONTENT_GENERATOR_QUEUE_EVENTS.GENERATE_HASHTAGS, data)
  }

  generate_copy(data: ContentGeneratorQueueData) {
    this.queue.add(CONTENT_GENERATOR_QUEUE_EVENTS.GENERATE_COPY, data)
  }

  generate_all(data: ContentGeneratorQueueData) {
    this.queue.add(CONTENT_GENERATOR_QUEUE_EVENTS.GENERATE_ALL, data)
  }
}
