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

  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.PENDING,
  })
  status?: ProjectStatus = ProjectStatus.PENDING
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
