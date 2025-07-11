import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'

export type PasswordResetDocument = HydratedDocument<PasswordReset>

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'password_resets',
})
export class PasswordReset {
  @Prop()
  email: string

  @Prop()
  token: string
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset)

PasswordResetSchema.index({ created_at: 1 }, { expireAfterSeconds: 3600 })
