import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { ApifyClient } from 'apify-client'
import { Job } from 'bull'
import { v4 as uuidv4 } from 'uuid'

import {
  ProjectInput,
  ProjectInputSource,
  ProjectProgress,
  ProjectStatus,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'

import { R2Service } from 'apps/backend/src/services/r2.service'

import { AnalyzeVideoQueue } from '../analyze-video/analyze-video.queue'
import {
  DownloadVideoData,
  INPUT_VIDEO_PARSER_QUEUE_EVENTS,
  INPUT_VIDEO_PARSER_QUEUE_NAME,
} from './input-video-parser.queue'

@Processor(INPUT_VIDEO_PARSER_QUEUE_NAME)
export class InputVideoParserQueueProcessor {
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

  async get_instagram_video(url: string): Promise<ProjectInput> {
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

    return {
      url: video_url as string,
      source: ProjectInputSource.INSTAGRAM,
    }
  }

  async get_tiktok_video(url: string): Promise<ProjectInput> {
    const input = {
      startUrls: [url],
      dateRange: 'DEFAULT',
      location: 'US',
    }

    const run = await this.client.actor('apidojo/tiktok-scraper').call(input)

    const { items } = await this.client
      .dataset(run.defaultDatasetId)
      .listItems()

    const video_url = (items[0]?.video as any)?.url

    if (!video_url) {
      throw new Error('Video URL not found in the dataset items')
    }

    return {
      url: video_url as string,
      source: ProjectInputSource.TIKTOK,
    }
  }

  async get_youtube_video(url: string): Promise<ProjectInput> {
    return {
      url,
      source: ProjectInputSource.YOUTUBE,
    }
  }

  get_download_url(url: string) {
    let hostname: string

    try {
      const parsed_url = new URL(url)
      hostname = parsed_url.hostname.replace('www.', '')
    } catch (error) {
      throw new Error('Invalid URL')
    }

    switch (hostname) {
      case 'instagram.com':
      case 'www.instagram.com':
        return this.get_instagram_video(url)

      case 'tiktok.com':
      case 'www.tiktok.com':
      case 'vt.tiktok.com':
        return this.get_tiktok_video(url)

      case 'youtube.com':
      case 'www.youtube.com':
      case 'youtu.be':
        return this.get_youtube_video(url)
      default:
        throw new Error(`Unsupported URL domain: ${hostname}`)
    }
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

  @Process(INPUT_VIDEO_PARSER_QUEUE_EVENTS.DOWNLOAD_VIDEO)
  async process(job: Job<DownloadVideoData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        status: ProjectStatus.IN_PROGRESS,
        progress: ProjectProgress.FETCHING_INPUT,
      })

      const { url: video_url, source } = await this.get_download_url(
        project.input.url,
      )

      if (source == ProjectInputSource.YOUTUBE) {
        await this.project_service.update(project._id, {
          progress: ProjectProgress.INPUT_FETCHED,
          input: {
            ...project.input,
            source,
          },
        })

        this.analyze_video_queue.analyze_youtube_video({
          project_id: project._id,
        })
      } else {
        const video_buffer = await this.download_video(video_url)

        const file_key = await this.save_video(video_buffer)

        await this.project_service.update(project._id, {
          progress: ProjectProgress.INPUT_FETCHED,
          input: {
            ...project.input,
            source,
            file_key,
          },
        })

        this.analyze_video_queue.upload_video({ project_id: project._id })
      }
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }
}
