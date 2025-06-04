import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { z } from 'zod'

import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'

const scenes_schema = z.object({
  scenes: z.array(
    z.object({
      scene_number: z.number().int().min(1).max(6),
      image_prompt: z.string().min(10).max(500),
      voiceover_script: z.string().min(10).max(500),
    }),
  ),
})

@Injectable()
export class OpenAIService {
  client: OpenAI

  constructor(private readonly configService: ConfigService) {
    const api_key = this.configService.get('openai.api_key')

    this.client = new OpenAI({
      apiKey: api_key,
    })
  }

  async generate_scenes({ description }: { description: string }) {
    console.log('Description', description)

    const response = await this.client.responses.parse({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content:
            'You are a creative AI assistant helping generate visual storyboards for short-form content. Based on the inputs below, your task is to generate a sequence of realistic image prompts, subtle movement ideas, and voiceover lines for each scene.',
        },
        {
          role: 'user',
          content: `
**Input:**

* Description: ${description}
* Number of Scenes: 6

---

**Instructions:**

1. Generate exactly 6 scenes.

2. For each scene, create:

   * **image\_prompt**: A vivid, realistic visual prompt based on the Description.
     Must reflect real life, written in English, optimized for tools like DALL·E or Midjourney.
   * **voiceover\_script**: create voiceover scripts for each of the 6 scenes

3. Keep all scenes thematically connected and based on the Description.
`,
        },
      ],
      text: {
        format: zodTextFormat(scenes_schema, 'scenes'),
      },
    })

    return response.output_parsed
  }
}
