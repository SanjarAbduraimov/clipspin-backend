import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import bcrypt from 'bcrypt'
import { HydratedDocument } from 'mongoose'

import { UserRole } from '../common/enums/role.enum'
import { EntityStatus } from '../common/enums/status.enum'
import { COLLECTION_TIMESTAMPS } from '../constants'

export type UserDocument = HydratedDocument<User>

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'users',
})
export class User {
  @Prop()
  full_name: string

  @Prop({ unique: true })
  email: string

  @Prop()
  phone_number?: string

  @Prop({ type: String, select: false })
  password: string

  @Prop({
    type: String,
    required: true,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus = EntityStatus.ACTIVE

  @Prop()
  deleted_at?: Date
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre('save', async function (this: any, next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }

  next()
})
