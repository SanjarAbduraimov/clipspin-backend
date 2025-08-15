import { IsBoolean, IsEnum, IsString, IsUrl } from 'class-validator'

import { HeygenAvatarGender } from '../../../models/heygen-avatar.schema'

export class CreateHeygenAvatarDTO {
  @IsString()
  avatar_id: string

  @IsEnum(HeygenAvatarGender)
  gender: HeygenAvatarGender

  @IsString()
  avatar_name: string

  @IsString()
  default_voice_id: string

  @IsString()
  @IsUrl()
  preview_image_url: string

  @IsString()
  @IsUrl()
  preview_video_url: string

  @IsBoolean()
  premium: boolean


}
