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

const script_schema = z.object({
  quote_text: z.string(),
  quote_author: z.string(),
  image_prompt: z.string(),
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

    return response.output_parsed.scenes
  }

  async generate_script({ description }: { description: string }) {
    const response = await this.client.responses.parse({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: `
ROLE:
You are an expert prompt engineer specializing in generating sequential quotes and image prompts for engaging, narrative-driven short videos. Your prompts will create a seamless narrative flow, capturing the viewer’s attention and guiding them through a cohesive short video story.

USER INPUT:
The user will provide you with the core idea or theme of the video they wish to create.

TASK:
Return a JSON object with the following keys:

quoteText: The quote itself. Do not change original quote. If it is comples and has more sentences, try to modify it.

quoteAuthor: The complete name of the quote’s original author. If user doesn't provide author information, put it as a Unknown

image_prompt: A vivid, cinematic, and highly descriptive prompt for the image. The description must detail the environment, subjects, lighting, mood, and overall composition. Always include exhaustive background details for characters and scenes. End every image prompt with:
Style: cinematic, high-detail, ultra-realistic, 8K, wide-angle.
`,
        },
        {
          role: 'user',
          content: `
Quote Idea: ${description}
`,
        },
      ],
      text: {
        format: zodTextFormat(script_schema, 'scenes'),
      },
    })

    return response.output_parsed
  }

  async generate_talking_head_script({ description }: { description: string }) {
    const response = await this.client.responses.parse({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: `
ROLE:
You are an expert prompt engineer specializing in generating sequential quotes and image prompts for engaging, narrative-driven short videos. Your prompts will create a seamless narrative flow, capturing the viewer’s attention and guiding them through a cohesive short video story.

USER INPUT:
The user will provide you with the core idea or theme of the video they wish to create.

TASK:
Return a JSON object with the following keys:

quoteText: The quote itself. Do not change original quote. If it is comples and has more sentences, try to modify it.

quoteAuthor: The complete name of the quote’s original author. If user doesn't provide author information, put it as a Unknown

image_prompt: A vivid, cinematic, and highly descriptive prompt for the image. The description must detail the environment, subjects, lighting, mood, and overall composition. Always include exhaustive background details for characters and scenes. End every image prompt with:
Style: cinematic, high-detail, ultra-realistic, 8K, wide-angle.
`,
        },
        {
          role: 'user',
          content: `
Quote Idea: ${description}
`,
        },
      ],
      text: {
        format: zodTextFormat(script_schema, 'scenes'),
      },
    })

    return response.output_parsed
  }
}
