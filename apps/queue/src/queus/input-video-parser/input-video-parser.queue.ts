import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const INPUT_VIDEO_PARSER_QUEUE_NAME = 'input-video-parser-queue'

export enum INPUT_VIDEO_PARSER_QUEUE_EVENTS {
  DOWNLOAD_VIDEO = 'download_video',
}

export interface DownloadVideoData {
  project_id: Types.ObjectId
}

@Injectable()
export class InputVideoParserQueue {
  constructor(
    @InjectQueue(INPUT_VIDEO_PARSER_QUEUE_NAME) private queue: Queue,
  ) {}

  download_video(data: DownloadVideoData) {
    this.queue.add(INPUT_VIDEO_PARSER_QUEUE_EVENTS.DOWNLOAD_VIDEO, data)
  }
}
