import {
  File,
  GoogleGenAI,
  Type,
  createPartFromUri,
  createUserContent,
} from '@google/genai'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Blob } from 'buffer'

@Injectable()
export class GenAIService {
  client: GoogleGenAI
  constructor(private configService: ConfigService) {
    const api_key = this.configService.get<string>('google.genai_api_key')

    this.client = new GoogleGenAI({ apiKey: api_key })
  }

  async upload_file(file: Buffer) {
    const blob = new Blob([file], { type: 'video/mp4' })

    const result = await this.client.files.upload({
      file: blob,
      config: { mimeType: 'video/mp4' },
    })

    return result
  }

  async wait_file_to_process(file_name: string) {
    return new Promise<File>((resolve, reject) => {
      let attemps = 0

      const interval = setInterval(async () => {
        const file_status = await this.client.files.get({ name: file_name })

        if (file_status.state === 'ACTIVE') {
          clearInterval(interval)
          resolve(file_status)
        } else if (attemps > 15) {
          clearInterval(interval)
          return reject('Video is not processing timed out')
        } else {
          attemps++
        }
      }, 2000)
    })
  }

  async analyze_video(file: File) {
    const response = await this.client.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: createUserContent([
        createPartFromUri(file.uri, file.mimeType),
        `Give 3 options for idea after analysing the video, here is the promt:
You are a scriptwriting expert and viral content strategist. Your job is to take a short viral video script and create three distinct versions:
1. A remixed version that keeps the same viral energy and tone.
2. A version with a negative hook that builds curiosity or highlights a pain point.
3. A version written in the bold, direct, value-packed style of Alex Hormozi.
Avoid using emojis, video directions, or any kind of markup. Return only the raw text of the three scripts.rovide an analysis of the TikTok video based solely on the following criteria: 1. Determine which single category best fits the video based on its content and potential connection to the video’s success. Choose only one from: Tutorial, Review-Showcase, Giveaway, Challenge, Behind-the-scenes, Reaction, Vlog, Before-After, Q&A, Unboxing-or-Hauls, Skit, Collaboration. If none apply, select Other. 2. Determine Hook and Visual Hook and why it grabs the viewer's attention. 3 Determine content type. Choose only from User-generated or Professionally-produced. 4. Determine presence and effectiveness of any CTA (e.g., “follow,” “comment,” “share”) 5. Given the video's popularity, explain in one sentence what makes it effective. 6. Categorize the video by tone. Select a single category best fits the video based on its content and potential connection to the video’s success. Choose only one from: High-Energy, Funny-Playful, Informative-Educational, Cool-Confident, Calming-Soothing, Rant-Frustrated, Romantic-Sentimental, Inspirational-Motivational.`,
      ]),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            remix_script: {
              type: Type.STRING,
              description:
                'A remixed version of the script that keeps the same viral energy and tone. The script should be between 100 and 150 words',
            },
            negative_hook_script: {
              type: Type.STRING,
              description:
                'A version of the script with a negative hook that builds curiosity or highlights a pain point. The script should be between 100 and 150 words',
            },
            hormozi_style_script: {
              type: Type.STRING,
              description:
                'A version of the script written in the bold, direct, value-packed style of Alex Hormozi. The script should be between 100 and 150 words',
            },
          },
          required: [
            'remix_script',
            'negative_hook_script',
            'hormozi_style_script',
          ],
        },
      },
    })

    const analysis = JSON.parse(response.text)

    return Object.values(analysis).map((value) => ({ script: value as string }))
  }

  async analyze_youtube_video(url: string) {
    const response = await this.client.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: createUserContent([
        `Give 3 options for idea after analysing the video, here is the promt:
You are a scriptwriting expert and viral content strategist. Your job is to take a short viral video script and create three distinct versions:
1. A remixed version that keeps the same viral energy and tone.
2. A version with a negative hook that builds curiosity or highlights a pain point.
3. A version written in the bold, direct, value-packed style of Alex Hormozi.
Avoid using emojis, video directions, or any kind of markup. Return only the raw text of the three scripts.rovide an analysis of the TikTok video based solely on the following criteria: 1. Determine which single category best fits the video based on its content and potential connection to the video’s success. Choose only one from: Tutorial, Review-Showcase, Giveaway, Challenge, Behind-the-scenes, Reaction, Vlog, Before-After, Q&A, Unboxing-or-Hauls, Skit, Collaboration. If none apply, select Other. 2. Determine Hook and Visual Hook and why it grabs the viewer's attention. 3 Determine content type. Choose only from User-generated or Professionally-produced. 4. Determine presence and effectiveness of any CTA (e.g., “follow,” “comment,” “share”) 5. Given the video's popularity, explain in one sentence what makes it effective. 6. Categorize the video by tone. Select a single category best fits the video based on its content and potential connection to the video’s success. Choose only one from: High-Energy, Funny-Playful, Informative-Educational, Cool-Confident, Calming-Soothing, Rant-Frustrated, Romantic-Sentimental, Inspirational-Motivational.`,
        {
          fileData: {
            fileUri: url,
          },
        },
      ]),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            remix_script: {
              type: Type.STRING,
              description:
                'A remixed version of the script that keeps the same viral energy and tone. The script should be between 100 and 150 words',
            },
            negative_hook_script: {
              type: Type.STRING,
              description:
                'A version of the script with a negative hook that builds curiosity or highlights a pain point. The script should be between 100 and 150 words',
            },
            hormozi_style_script: {
              type: Type.STRING,
              description:
                'A version of the script written in the bold, direct, value-packed style of Alex Hormozi. The script should be between 100 and 150 words',
            },
          },
          required: [
            'remix_script',
            'negative_hook_script',
            'hormozi_style_script',
          ],
        },
      },
    })

    const analysis = JSON.parse(response.text)

    return Object.values(analysis).map((value) => ({ script: value as string }))
  }
}
