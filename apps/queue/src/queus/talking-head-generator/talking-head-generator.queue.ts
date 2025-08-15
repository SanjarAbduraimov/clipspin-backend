import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const TALKING_HEAD_GENERATOR_QUEUE_NAME = 'talking-head-generator-queue'

export enum TALKING_HEAD_GENERATOR_QUEUE_EVENTS {
  GENERATE_SCENES = 'generate_scene',
  GENERATE_SCENE_IMAGE = 'generate_scene_image',
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
    this.queue.add(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_SCENES, data)
  }
  generate_scene_images(data: GenerateTalkingHeadData) {
    this.queue.add(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_SCENE_IMAGE, data)
  }

  generate_video(data: GenerateTalkingHeadData) {
    this.queue.add(TALKING_HEAD_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO, data)
  }
}
