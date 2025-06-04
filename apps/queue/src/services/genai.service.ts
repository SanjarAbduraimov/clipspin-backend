import {
  File,
  GoogleGenAI,
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
        `Provide an analysis of the TikTok video based solely on the following criteria: 1. Determine which single category best fits the video based on its content and potential connection to the video’s success. Choose only one from: Tutorial, Review-Showcase, Giveaway, Challenge, Behind-the-scenes, Reaction, Vlog, Before-After, Q&A, Unboxing-or-Hauls, Skit, Collaboration. If none apply, select Other. 2. Determine Hook and Visual Hook and why it grabs the viewer's attention. 3 Determine content type. Choose only from User-generated or Professionally-produced. 4. Determine presence and effectiveness of any CTA (e.g., “follow,” “comment,” “share”) 5. Given the video's popularity, explain in one sentence what makes it effective. 6. Categorize the video by tone. Select a single category best fits the video based on its content and potential connection to the video’s success. Choose only one from: High-Energy, Funny-Playful, Informative-Educational, Cool-Confident, Calming-Soothing, Rant-Frustrated, Romantic-Sentimental, Inspirational-Motivational.`,
      ]),
    })

    return response
  }
}
