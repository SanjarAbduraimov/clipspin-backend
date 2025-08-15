import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ProjectErrorCause } from 'apps/backend/src/models/project.schema'
import axios, { Axios } from 'axios'

// Heygen Generate Video Interfaces
export interface HeygenVoiceVariable {
  name: string
  type: 'voice'
  properties: {
    voice_id: string
    locale: string | null
  }
}

export interface HeygenAvatarVariable {
  name: string
  type: 'character'
  properties: {
    character_id: string
    type: 'avatar'
  }
}

export interface HeygenImageVariable {
  name: string
  type: 'image'
  properties: {
    url: string
    asset_id: string | null
    fit: 'none' | 'cover' | 'contain' | 'fill'
  }
}

export interface HeygenTextVariable {
  name: string
  type: 'text'
  properties: {
    content: string
  }
}

export type HeygenVariable = HeygenVoiceVariable | HeygenAvatarVariable | HeygenImageVariable | HeygenTextVariable

export interface HeygenGenerateVideoRequest {
  title: string
  variables: Record<string, HeygenVariable>
  test?: boolean
  caption?: boolean
  dimension: {
    width: number
    height: number
  }
}

export interface HeygenGenerateVideoParams {
  title: string
  callback_id: string
  variables?: Record<string, HeygenVariable>
  dimension?: {
    width: number
    height: number
  }
  test?: boolean
  caption?: boolean
}

@Injectable()
export class HeygenService {
  client: Axios
  callback_url: string

  constructor(private readonly configService: ConfigService) {
    const api_key = this.configService.get('heygen.api_key')
    this.callback_url = this.configService.get('heygen.callback_url')

    this.client = axios.create({
      baseURL: 'https://api.heygen.com',
      headers: {
        'X-Api-Key': api_key,
      },
    })
  }

  async generate_video({
    title,
    callback_id,
    variables,
    dimension = { width: 720, height: 1280 },
    test = false,
    caption = false,
  }: HeygenGenerateVideoParams): Promise<any> {
    try {
      const response = await this.client.post(
        `/v2/template/e26f26f58d574ef286ee5528116d7b44/generate`,
        {
          caption,
          title,
          variables: variables,
          dimension,
          test,
          option: {
            remove_logo: true,
          },
          callback_url: this.callback_url,
          callback_id,
        },
      )
      return response.data
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VIDEO)
    }
  }
}
