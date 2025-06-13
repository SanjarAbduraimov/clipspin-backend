import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'

export type UserSubscriptionDocument = HydratedDocument<UserSubscription>

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'user-subscriptions',
})
export class UserSubscription {
  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'subscription-plans' })
  subscription_plan: Types.ObjectId

  @Prop({ default: 0 })
  monthly_credits: number

  @Prop({ default: 0 })
  purchased_credits: number
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription)
