import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'
import { ProjectType } from './project.schema'

export type SubscriptionPlanDocument = HydratedDocument<SubscriptionPlan>

export class ProjectTypePrice {
  @Prop({ required: true })
  project_type: ProjectType

  @Prop({ required: true })
  credit_cost: number
}

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'subscription-plans',
})
export class SubscriptionPlan {
  @Prop()
  name: number

  @Prop()
  description?: string

  @Prop()
  price: number

  @Prop()
  credits: number

  @Prop({ type: [ProjectTypePrice], required: true })
  project_type_prices: ProjectTypePrice[]

  @Prop()
  stripe_price_id?: string
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan)
