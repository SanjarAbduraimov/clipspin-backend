import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { COLLECTION_TIMESTAMPS, OTP_EXPIRES_IN } from '../constants'

export type OTPDocument = HydratedDocument<OTP>

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'otps',
})
export class OTP {
  @Prop()
  code: number

  @Prop()
  code_hash: string

  @Prop()
  email: string
}

export const OTPSchema = SchemaFactory.createForClass(OTP)

OTPSchema.index({ created_at: 1 }, { expireAfterSeconds: OTP_EXPIRES_IN })
