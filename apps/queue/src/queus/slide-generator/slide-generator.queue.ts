import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const SLIDE_GENERATOR_QUEUE_NAME = 'slide-generator-queue'

export enum SLIDE_GENERATOR_QUEUE_EVENTS {
  GENERATE_SCENES = 'generate_scenes',
  GENERATE_SCENE_IMAGE = 'generate_scene_image',
  GENERATE_VIDEO = 'generate_video',
}

export interface GenerateSlidesData {
  project_id: Types.ObjectId
}

@Injectable()
export class SlideGeneratorQueue {
  constructor(@InjectQueue(SLIDE_GENERATOR_QUEUE_NAME) private queue: Queue) {}

  generate_slides(data: GenerateSlidesData) {
    this.queue.add(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_SCENES, data)
  }

  generate_scene_images(data: GenerateSlidesData) {
    this.queue.add(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_SCENE_IMAGE, data)
  }

  generate_video(data: GenerateSlidesData) {
    this.queue.add(SLIDE_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO, data)
  }
}
