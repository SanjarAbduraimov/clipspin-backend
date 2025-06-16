import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'

export type UserSubscriptionDocument = HydratedDocument<UserSubscription>

export class SubscriptionCredits {
  @Prop({ default: 0 })
  total: number

  @Prop({ default: 0 })
  remaining: number
}

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'user-subscriptions',
})
export class UserSubscription {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan' })
  subscription_plan: Types.ObjectId

  @Prop({ type: SubscriptionCredits })
  monthly_credits: SubscriptionCredits

  @Prop({ type: SubscriptionCredits, default: { total: 0, remaining: 0 } })
  purchased_credits: SubscriptionCredits

  @Prop({ type: Date })
  expires_at: Date
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription)
