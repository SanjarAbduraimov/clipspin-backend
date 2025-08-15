import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { EntityStatus } from '../common/enums/status.enum'
import { COLLECTION_TIMESTAMPS } from '../constants'

export type HeygenAvatarDocument = HydratedDocument<HeygenAvatar>

export enum HeygenAvatarGender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'heygen-avatars',
})
export class HeygenAvatar {
  @Prop({ required: true })
  avatar_id: string

  @Prop({
    type: String,
    enum: HeygenAvatarGender,
    required: true,
  })
  gender: HeygenAvatarGender

  @Prop({ required: true })
  avatar_name: string

  @Prop({ required: true })
  preview_image_url: string

  @Prop({ required: true })
  preview_video_url: string

  @Prop({ required: true })
  premium: boolean

  @Prop({ required: true })
  default_voice_id: string

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus = EntityStatus.ACTIVE

  @Prop()
  deleted_at?: Date
}

export const HeygenAvatarSchema = SchemaFactory.createForClass(HeygenAvatar)
