import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'

export type ProjectDocument = HydratedDocument<Project>

export enum ProjectStatus {
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export enum ProjectProgress {
  FETCHING_INPUT = 'fetching_input',
  ANALYZING_INPUT = 'analyzing_input',
  GENERATING_SCENES = 'generating_scenes',
  GENERATING_SCENE_IMAGES = 'generating_scene_images',
  GENERATING_VIDEO = 'generating_video',
}

export class Scene {
  @Prop()
  scene_number?: number

  @Prop()
  image_prompt?: string

  @Prop()
  voiceover_script?: string

  @Prop()
  image_url?: string
}

export class ProjectResult {
  @Prop()
  video_url: string
}

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'projects',
})
export class Project {
  @Prop()
  title: string

  @Prop()
  input_video_url: string

  @Prop()
  file_url?: string

  @Prop()
  input_summary?: string

  @Prop({ type: [Scene] })
  scenes?: Scene[]

  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.PENDING,
  })
  status?: ProjectStatus = ProjectStatus.PENDING

  @Prop({
    type: String,
    enum: ProjectProgress,
  })
  progress?: ProjectProgress

  @Prop({ type: Scene })
  result?: ProjectResult
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
