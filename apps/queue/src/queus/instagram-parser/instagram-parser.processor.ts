import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { ApifyClient } from 'apify-client'
import { Job } from 'bull'
import { v4 as uuidv4 } from 'uuid'

import {
  ProjectProgress,
  ProjectStatus,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { R2Service } from 'apps/backend/src/services/r2.service'

import { AnalyzeVideoQueue } from '../analyze-video/analyze-video.queue'
import {
  DownloadVideoData,
  INSTAGRAM_PARSER_QUEUE_EVENTS,
  INSTAGRAM_PARSER_QUEUE_NAME,
} from './instagram-parser.queue'

@Processor(INSTAGRAM_PARSER_QUEUE_NAME)
export class InstagramParserQueueProcessor {
  client: ApifyClient

  constructor(
    private readonly config_service: ConfigService,
    private readonly project_service: ProjectService,
    private readonly r2_service: R2Service,
    private readonly analyze_video_queue: AnalyzeVideoQueue,
  ) {
    const token = this.config_service.get('apify.token')

    this.client = new ApifyClient({
      token,
    })
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data: `,
      job.data,
    )
  }

  async get_download_url(url: string): Promise<string> {
    const input = {
      directUrls: [url],
      resultsType: 'posts',
      resultsLimit: 200,
      searchType: 'hashtag',
      searchLimit: 1,
    }

    const run = await this.client.actor('apify/instagram-scraper').call(input)

    const { items } = await this.client
      .dataset(run.defaultDatasetId)
      .listItems()

    const video_url = items[0]?.videoUrl

    if (!video_url) {
      throw new Error('Video URL not found in the dataset items')
    }

    return video_url as string
  }

  async download_video(url: string): Promise<Buffer> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`)
    }

    const array_buffer = await response.arrayBuffer()

    return Buffer.from(array_buffer)
  }

  async save_video(buffer: Buffer): Promise<string> {
    const id = uuidv4()
    const key = `${id}.mp4`

    await this.r2_service.upload_file({
      key,
      body: buffer,
      content_type: 'video/mp4',
    })

    return key
  }

  @Process(INSTAGRAM_PARSER_QUEUE_EVENTS.DOWNLOAD_VIDEO)
  async process(job: Job<DownloadVideoData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        status: ProjectStatus.IN_PROGRESS,
        progress: ProjectProgress.FETCHING_INPUT,
      })

      const video_url = await this.get_download_url(project.input_video_url)

      const video_buffer = await this.download_video(video_url)

      const path = await this.save_video(video_buffer)

      await this.project_service.update(project._id, {
        file_key: path,
        progress: ProjectProgress.INPUT_FETCHED,
      })

      this.analyze_video_queue.upload_video({ project_id: project._id })
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }
}
