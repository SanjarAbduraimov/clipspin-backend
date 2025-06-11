import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'
import { ProjectType } from './project.schema'

export type CreditConfigDocument = HydratedDocument<CreditConfig>

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'credit-configs',
})
export class CreditConfig {
  @Prop({ enum: ProjectType })
  project_type: string

  @Prop()
  credit_cost: number

  @Prop()
  description?: string
}

export const CreditConfigSchema = SchemaFactory.createForClass(CreditConfig)
