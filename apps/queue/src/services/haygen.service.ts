import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { Axios } from 'axios'

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
    script,
    callback_id,
    voice_id,
  }: {
    title: string
    script: string
    callback_id: string
    voice_id: string
  }): Promise<any> {
    try {
      const response = await this.client.post(
        `/v2/template/23309bc49e3c4f9da72f34aab6b6108b/generate`,
        {
          caption: false,
          title: 'TEST API',
          variables: {
            script_en: {
              name: 'script_en',
              type: 'text',
              properties: {
                content: script,
              },
            },
            script_voice: {
              name: 'script_voice',
              type: 'voice',
              properties: {
                voice_id,
              },
            },
          },
          dimension: {
            width: 720,
            height: 1280,
          },
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
