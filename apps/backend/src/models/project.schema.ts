import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'

export type ProjectDocument = HydratedDocument<Project>

export enum ProjectType {
  SLIDE_SHOW = 'slide_show',
  TEXT_AUDIOGRAM = 'text_audiogram',
  TALKING_HEAD = 'talking_head',
  PROFESSIONAL = 'professional',
}

export enum ProjectStatus {
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export enum ProjectProgress {
  FETCHING_INPUT = 'fetching_input',
  ANALYZING_INPUT = 'analyzing_input',
  SUMMARY_GENERATED = 'summary_generated',
  GENERATING_SCRIPT = 'generating_script',
  GENERATING_IMAGES = 'generating_images',
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

export class Script {
  @Prop()
  quote_text?: string

  @Prop()
  quote_author?: string

  @Prop()
  image_prompt?: string

  @Prop()
  image_url?: string
}

export class TalkingHeadScript {
  @Prop()
  title?: string

  @Prop()
  script?: string
}

export class ProjectResult {
  @Prop()
  video_url?: string

  @Prop()
  video_id?: string
}

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'projects',
})
export class Project {
  @Prop({
    type: String,
    enum: ProjectType,
  })
  type: ProjectType

  @Prop()
  title: string

  @Prop()
  input_video_url: string

  @Prop()
  file_key?: string

  @Prop()
  input_summary?: string

  @Prop({ type: [Scene] })
  scenes?: Scene[]

  @Prop({ type: Script })
  script?: Script

  @Prop({ type: TalkingHeadScript })
  talking_head_script?: TalkingHeadScript

  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.PENDING,
  })
  status: ProjectStatus = ProjectStatus.PENDING

  @Prop({
    type: String,
    enum: ProjectProgress,
  })
  progress?: ProjectProgress

  @Prop({ type: Scene })
  result?: ProjectResult
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
