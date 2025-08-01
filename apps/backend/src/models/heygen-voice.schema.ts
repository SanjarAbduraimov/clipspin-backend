import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { COLLECTION_TIMESTAMPS } from '../constants'

export type HeygenVoiceDocument = HydratedDocument<HeygenVoice>

export enum HeygenVoiceGender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'heygen-voices',
})
export class HeygenVoice {
  @Prop({ required: true })
  voice_id: string

  @Prop({ required: true })
  language: string

  @Prop({
    type: String,
    enum: HeygenVoiceGender,
    required: true,
  })
  gender: HeygenVoiceGender

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  preview_audio: string

  @Prop({ required: true })
  support_pause: boolean

  @Prop({ required: true })
  emotion_support: boolean

  @Prop({ required: true })
  support_interactive_avatar: boolean

  @Prop({ required: true })
  support_locale: boolean
}

export const HeygenVoiceSchema = SchemaFactory.createForClass(HeygenVoice)
