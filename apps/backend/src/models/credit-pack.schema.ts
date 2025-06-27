import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'

export type CreditPackDocument = HydratedDocument<CreditPack>

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'credit-packs',
})
export class CreditPack {
  @Prop()
  name: string

  @Prop()
  description?: string

  @Prop()
  price: number

  @Prop()
  credits: number

  @Prop()
  stripe_price_id?: string
}

export const CreditPackSchema = SchemaFactory.createForClass(CreditPack)
