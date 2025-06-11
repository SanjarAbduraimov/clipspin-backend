import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'

export type UserBalanceDocument = HydratedDocument<UserBalance>

class CreditHistoryEntry {
  @Prop()
  amount: number

  @Prop()
  reason?: string

  @Prop({ default: Date.now })
  date: Date
}

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'user-balances',
})
export class UserBalance {
  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId

  @Prop({ default: 0 })
  credits: number

  @Prop({ type: [CreditHistoryEntry], default: [] })
  credits_history?: CreditHistoryEntry[]
}

export const UserBalanceSchema = SchemaFactory.createForClass(UserBalance)
