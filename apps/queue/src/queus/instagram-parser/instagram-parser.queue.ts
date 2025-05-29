import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const INSTAGRAM_PARSER_QUEUE_NAME = 'input-queue'

export enum INSTAGRAM_PARSER_QUEUE_EVENTS {
  DOWNLOAD_VIDEO = 'download_video',
}

export interface DownloadVideoData {
  project_id: Types.ObjectId
}

@Injectable()
export class InstagramParserQueue {
  constructor(@InjectQueue(INSTAGRAM_PARSER_QUEUE_NAME) private queue: Queue) {}

  download_video(data: DownloadVideoData) {
    this.queue.add(INSTAGRAM_PARSER_QUEUE_EVENTS.DOWNLOAD_VIDEO, data)
  }
}
