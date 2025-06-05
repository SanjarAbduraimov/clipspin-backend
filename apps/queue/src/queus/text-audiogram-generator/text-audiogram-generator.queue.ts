import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const TEXT_AUDIOGRAM_GENERATOR_QUEUE_NAME =
  'text-audiogram-generator-queue'

export enum TEXT_AUDIOGRAM_GENERATOR_QUEUE_EVENTS {
  GENERATE_SCRIPT = 'generate_script',
  GENERATE_IMAGE = 'generate_image',
  GENERATE_VIDEO = 'generate_video',
}

export interface GenerateTextAudiogramData {
  project_id: Types.ObjectId
}

@Injectable()
export class TextAudiogramGeneratorQueue {
  constructor(
    @InjectQueue(TEXT_AUDIOGRAM_GENERATOR_QUEUE_NAME) private queue: Queue,
  ) {}

  generate(data: GenerateTextAudiogramData) {
    this.queue.add(TEXT_AUDIOGRAM_GENERATOR_QUEUE_EVENTS.GENERATE_SCRIPT, data)
  }

  generate_scene_image(data: GenerateTextAudiogramData) {
    this.queue.add(TEXT_AUDIOGRAM_GENERATOR_QUEUE_EVENTS.GENERATE_IMAGE, data)
  }

  generate_video(data: GenerateTextAudiogramData) {
    this.queue.add(TEXT_AUDIOGRAM_GENERATOR_QUEUE_EVENTS.GENERATE_VIDEO, data)
  }
}
