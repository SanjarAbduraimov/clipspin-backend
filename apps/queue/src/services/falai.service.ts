import { FalClient, createFalClient } from '@fal-ai/client'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ProjectErrorCause } from 'apps/backend/src/models/project.schema'

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
  async generate_video({ prompt }: { prompt: string }) {
    try {
      const response = await this.client.subscribe('fal-ai/veo3', {
        input: {
          prompt,
          logs: true,
          onQueueUpdate: (update: { status: string; logs: any[] }) => {
            if (update.status === 'IN_PROGRESS') {
              update.logs.map((log) => log.message).forEach(console.log)
            }
          },
        },
      })
      return response.data.video
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VIDEO)
    }
  }
}
