import { IsBoolean, IsEnum, IsString, IsUrl } from 'class-validator'

import { HeygenVoiceGender } from '../../../models/heygen-voice.schema'

export class CreateHeygenVoiceDTO {
  @IsString()
  voice_id: string

  @IsString()
  language: string

  @IsEnum(HeygenVoiceGender)
  gender: HeygenVoiceGender

  @IsString()
  name: string

  @IsString()
  @IsUrl()
  preview_audio: string

  @IsBoolean()
  support_pause: boolean

  @IsBoolean()
  emotion_support: boolean

  @IsBoolean()
  support_interactive_avatar: boolean

  @IsBoolean()
  support_locale: boolean
}

