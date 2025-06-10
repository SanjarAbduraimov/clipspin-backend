import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const INPUT_QUEUE_NAME = 'input-queue'

export enum INPUT_QUEUE_EVENTS {
  PROCESS = 'process',
  GENERATE = 'generate',
  TEST = 'test',
}

export interface InputQueueData {
  project_id: Types.ObjectId
}

@Injectable()
export class InputQueue {
  constructor(@InjectQueue(INPUT_QUEUE_NAME) private queue: Queue) {}

  analyze(data: InputQueueData) {
    this.queue.add(INPUT_QUEUE_EVENTS.PROCESS, data)
  }

  generate(data: InputQueueData) {
    this.queue.add(INPUT_QUEUE_EVENTS.GENERATE, data)
  }
}
