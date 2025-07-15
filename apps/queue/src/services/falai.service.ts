import { FalClient, createFalClient } from '@fal-ai/client'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

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
      const response = await this.client.run('fal-ai/flux/dev', {
        input: {
          prompt: prompt,
          image_size: 'portrait_16_9',
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true,
        },
      })

      return response.data.images[0]
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_SCENES)
    }
  }
}
