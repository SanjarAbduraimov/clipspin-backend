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

export enum ProjectInputSource {
  YOUTUBE = 'youtube',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
}

export enum ProjectStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export enum ProjectProgress {
  FETCHING_INPUT = 'fetching_input',
  INPUT_FETCHED = 'input_fetched',

  ANALYZING_INPUT = 'analyzing_input',
  INPUT_ANALYZED = 'input_analyzed',

  GENERATING_SCRIPT = 'generating_script',
  SCRIPT_GENERATED = 'script_generated',

  GENERATING_IMAGES = 'generating_images',
  IMAGES_GENERATED = 'images_generated',

  GENERATING_VIDEO = 'generating_video',
  VIDEO_GENERATED = 'video_generated',

  SAVING_RESULTS = 'saving_results',
  RESULTS_SAVED = 'results_saved',
}

export class SlideShowScene {
  @Prop()
  scene_number?: number

  @Prop()
  image_prompt?: string

  @Prop()
  voiceover_script?: string

  @Prop()
  image_url?: string
}

export class SlideShowData {
  @Prop({ type: [SlideShowScene] })
  scenes?: SlideShowScene[]
}

export class TextAudiogramData {
  @Prop()
  quote_text?: string

  @Prop()
  quote_author?: string

  @Prop()
  image_prompt?: string

  @Prop()
  image_url?: string
}

export class TalkingHeadData {
  @Prop()
  title?: string

  @Prop()
  script?: string
}

export class ProjectOutput {
  @Prop()
  file_key?: string

  @Prop()
  video_id?: string
}

export class ProjectInput {
  @Prop()
  url: string

  @Prop({
    type: String,
    enum: ProjectInputSource,
  })
  source?: ProjectInputSource

  @Prop()
  file_key?: string
}

export class ProjectIdea {
  @Prop()
  script?: string
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

  @Prop({ type: ProjectInput })
  input: ProjectInput

  @Prop({ type: [ProjectIdea] })
  suggested_ideas?: ProjectIdea[]

  @Prop({ type: ProjectIdea })
  selected_idea?: ProjectIdea

  @Prop({ type: SlideShowData })
  slide_show_data?: SlideShowData

  @Prop({ type: TextAudiogramData })
  text_audiogram_data?: TextAudiogramData

  @Prop({ type: TalkingHeadData })
  talking_head_data?: TalkingHeadData

  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.QUEUED,
  })
  status: ProjectStatus = ProjectStatus.QUEUED

  @Prop({
    type: String,
    enum: ProjectProgress,
  })
  progress?: ProjectProgress

  @Prop({ type: SlideShowScene })
  output?: ProjectOutput
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
