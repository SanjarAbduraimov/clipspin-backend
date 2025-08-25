import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const VEO3_GENERATOR_QUEUE_NAME = 'veo3-generator-queue'

export enum VEO3_GENERATOR_QUEUE_EVENTS {
  GENERATE_SCENES = 'generate_scenes',
  GENERATE_SCENE_VIDEOS = 'generate_scene_videos',
  GENERATE_VEO3_VIDEO = 'generate_veo3_video',
  COMPOSE_VIDEO = 'compose_video',
}

export interface GenerateVeo3Data {
  project_id: Types.ObjectId
}
export interface GenerateSingleVeo3Data extends GenerateVeo3Data {
  scene_number: number
  prompt: string
}

@Injectable()
export class Veo3GeneratorQueue {
  constructor(@InjectQueue(VEO3_GENERATOR_QUEUE_NAME) private queue: Queue) {}

  generate(data: GenerateVeo3Data) {
    this.queue.add(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_SCENES, data)
  }

  generate_scene_videos(data: GenerateVeo3Data) {
    this.queue.add(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_SCENE_VIDEOS, data)
  }
  generate_veo3_video(data: GenerateSingleVeo3Data) {
    this.queue.add(VEO3_GENERATOR_QUEUE_EVENTS.GENERATE_VEO3_VIDEO, data)
  }

  compose_video(data: GenerateVeo3Data) {
    this.queue.add(VEO3_GENERATOR_QUEUE_EVENTS.COMPOSE_VIDEO, data)
  }
}
