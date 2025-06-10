import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const OUTPUT_QUEUE_NAME = 'output-queue'

export enum OUTPUT_QUEUE_EVENTS {
  SAVE = 'save',
}

export interface OutputQueueData {
  project_id: Types.ObjectId
  video_url: string
}

@Injectable()
export class OutputQueue {
  constructor(@InjectQueue(OUTPUT_QUEUE_NAME) private queue: Queue) {}

  save(data: OutputQueueData) {
    this.queue.add(OUTPUT_QUEUE_EVENTS.SAVE, data)
  }
}
