import { Expose, Transform } from 'class-transformer'

import { transform_object_id } from '../../../common/utils/transform-object-id'
import { HeygenAvatarGender } from '../../../models/heygen-avatar.schema'

export class HeygenAvatarResponseDTO {
  @Expose()
  @Transform(transform_object_id())
  _id: string

  @Expose()
  avatar_id: string

  @Expose()
  gender: HeygenAvatarGender

  @Expose()
  avatar_name: string

  @Expose()
  preview_image_url: string

  @Expose()
  preview_video_url: string

  @Expose()
  premium: boolean

  @Expose()
  default_voice_id: string

  @Expose()
  status: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
