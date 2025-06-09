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
    title,
    script,
    callback_id,
  }: {
    title: string
    script: string
    callback_id: string
  }): Promise<any> {
    const response = await this.client.post('/v2/video/generate', {
      title,
      caption: false,
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: 'Abigail_expressive_2024112501',
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: 'f772a099cbb7421eb0176240c611fc43',
            speed: 1,
          },
        },
      ],
      dimension: {
        width: 720,
        height: 1280,
      },
      background: {
        type: 'transparent',
      },
      option: {
        remove_logo: true,
      },
      callback_url: this.callback_url,
      callback_id,
    })

    return response.data
  }
}
