import { Expose, Transform } from 'class-transformer'

import { transform_object_id } from '../../../common/utils/transform-object-id'
import { HeygenVoiceGender } from '../../../models/heygen-voice.schema'

export class HeygenVoiceResponseDTO {
  @Expose()
  @Transform(transform_object_id)
  _id: string

  @Expose()
  voice_id: string

  @Expose()
  language: string

  @Expose()
  gender: HeygenVoiceGender

  @Expose()
  name: string

  @Expose()
  preview_audio: string

  @Expose()
  support_pause: boolean

  @Expose()
  emotion_support: boolean

  @Expose()
  support_interactive_avatar: boolean

  @Expose()
  support_locale: boolean

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
