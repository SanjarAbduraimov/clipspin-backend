import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { Axios } from 'axios'

import { Script } from 'apps/backend/src/models/project.schema'

@Injectable()
export class HeygenService {
  client: Axios

  constructor(private readonly configService: ConfigService) {
    const api_key = this.configService.get('heygen.api_key')

    this.client = axios.create({
      baseURL: 'https://api.heygen.com',
      headers: {
        'X-Api-Key': api_key,
      },
    })
  }

  async generate_video({ title, script }: { title: string; script: Script }) {
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
    })

    return response.data
  }
}
