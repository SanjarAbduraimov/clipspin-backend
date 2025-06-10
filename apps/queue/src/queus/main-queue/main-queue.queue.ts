import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

import { OutputQueueData } from '../output/output.queue'

export const MAIN_QUEUE_NAME = 'main-queue'

export enum MAIN_QUEUE_EVENTS {
  PROCESS = 'process',
  GENERATE = 'generate',
  OUTPUT = 'output',
  TEST = 'test',
}

export interface MainQueueData {
  project_id: Types.ObjectId
}

@Injectable()
export class MainQueue {
  constructor(@InjectQueue(MAIN_QUEUE_NAME) private queue: Queue) {}

  analyze(data: MainQueueData) {
    this.queue.add(MAIN_QUEUE_EVENTS.PROCESS, data)
  }

  generate(data: MainQueueData) {
    this.queue.add(MAIN_QUEUE_EVENTS.GENERATE, data)
  }

  output(data: OutputQueueData) {
    this.queue.add(MAIN_QUEUE_EVENTS.OUTPUT, data)
  }
}
