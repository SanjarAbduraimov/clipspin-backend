import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'creatomate'

import {
  ProjectErrorCause,
  SlideShowScene,
  TextAudiogramData,
} from 'apps/backend/src/models/project.schema'

@Injectable()
export class CreatomateService {
  client: Client
  slide_show_template_id: string
  text_audiogram_template_id: string

  constructor(private readonly configService: ConfigService) {
    const api_key = this.configService.get('creatomate.api_key')
    this.slide_show_template_id = this.configService.get(
      'creatomate.slide_show_template_id',
    )
    this.text_audiogram_template_id = this.configService.get(
      'creatomate.text_audiogram_template_id',
    )

    this.client = new Client(api_key)
  }

  async generate_slide_show({ scenes }: { scenes: SlideShowScene[] }) {
    try {
      const response = await this.client.render({
        templateId: this.slide_show_template_id,
        modifications: {
          'Music.source':
            'https://assets.json2video.com/clients/E6idlICdOy/uploads/keys-of-moon-the-success(chosic.com).mp3',
          'Image-1.source': `${scenes[0].image_url}`,
          'Subtitles-1.text': `${scenes[0].voiceover_script}`,
          'Voiceover-1.source': `${scenes[0].voiceover_script}`,

          'Image-2.source': `${scenes[1].image_url}`,
          'Subtitles-2.text': `${scenes[1].voiceover_script}`,
          'Voiceover-2.source': `${scenes[1].voiceover_script}`,

          'Image-3.source': `${scenes[2].image_url}`,
          'Subtitles-3.text': `${scenes[2].voiceover_script}`,
          'Voiceover-3.source': `${scenes[2].voiceover_script}`,

          'Image-4.source': `${scenes[3].image_url}`,
          'Subtitles-4.text': `${scenes[3].voiceover_script}`,
          'Voiceover-4.source': `${scenes[3].voiceover_script}`,

          'Image-5.source': `${scenes[4].image_url}`,
          'Subtitles-5.text': `${scenes[4].voiceover_script}`,
          'Voiceover-5.source': `${scenes[4].voiceover_script}`,

          'Image-6.source': `${scenes[5].image_url}`,
          'Subtitles-6.text': `${scenes[5].voiceover_script}`,
          'Voiceover-6.source': `${scenes[5].voiceover_script}`,
        },
      })

      return response[0].url
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VIDEO)
    }
  }

  async generate_text_audiogram({ script }: { script: TextAudiogramData }) {
    try {
      const response = await this.client.render({
        templateId: this.text_audiogram_template_id,
        modifications: {
          'Music.source':
            'https://assets.json2video.com/clients/psjag8xjj7/uploads/Stoicism.mp3',
          'Shape-1.fill_color': 'rgba(232,65,24,1)',
          'Shape-2.fill_color': 'rgba(232,65,24,1)',

          'Image.source': `${script.image_url}`,
          'Voice.source': `${script.quote_text}`,
          'Quote.text': `${script.quote_text}`,
          'Name.text': `${script.quote_author}`,
        },
      })

      return response[0].url
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_VIDEO)
    }
  }
}
