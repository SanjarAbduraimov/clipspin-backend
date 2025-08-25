import { FalClient, createFalClient } from '@fal-ai/client'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ProjectErrorCause } from 'apps/backend/src/models/project.schema'

export interface Keyframe {
  url: string
  timestamp: number
  duration: number
}

@Injectable()
export class FalAIService {
  client: FalClient

  constructor(private readonly configService: ConfigService) {
    const api_key = this.configService.get('falai.api_key')

    this.client = createFalClient({
      credentials: api_key,
    })
  }

  async generate_image({ prompt }: { prompt: string }) {
    try {
      const response = await this.client.run('fal-ai/flux-pro/v1.1', {
        input: {
          prompt: prompt,
          image_size: 'portrait_16_9',
          num_images: 1,
          enable_safety_checker: true,
        },
      })

      return response.data.images[0]
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_SCENES)
    }
  }
  async generate_veo3_video({ prompt }: { prompt: string }) {
    try {
      const response = await this.client.subscribe('fal-ai/veo3/fast', {
        input: {
          prompt,
          aspect_ratio: '9:16',
          duration: '8s',
          enhance_prompt: true,
          auto_fix: true,
          resolution: '720p',
          generate_audio: true,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            update.logs.map((log) => log.message).forEach(console.log)
          }
        },
      })

      return response.data.video
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VEO3_VIDEO)
    }
  }

  async compose_video({
    id,
    keyframes,
  }: {
    id: string
    keyframes: Keyframe[]
  }) {
    try {
      const response = await this.client.subscribe(
        'fal-ai/ffmpeg-api/compose',
        {
          input: {
            tracks: [
              {
                id,
                type: 'video',
                keyframes,
              },
            ],
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === 'IN_PROGRESS') {
              update.logs.map((log) => log.message).forEach(console.log)
            }
          },
        },
      )
      return {
        video_url: response.data.video_url,
        request_id: response.requestId,
      }
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VIDEO)
    }
  }
}
