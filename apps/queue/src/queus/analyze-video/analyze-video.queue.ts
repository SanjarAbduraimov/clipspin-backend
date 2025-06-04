import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { Types } from 'mongoose'

export const ANALYZE_VIDEO_QUEUE_NAME = 'analyze-video-queue'

export enum ANALYZE_VIDEO_QUEUE_EVENTS {
  UPLOAD_VIDEO = 'upload_video',
  ANALYZE_VIDEO = 'analyze_video',
}

export interface UploadVideoData {
  project_id: Types.ObjectId
}

export interface AnalyzeVideoData {
  project_id: Types.ObjectId
  file_name: string
}

@Injectable()
export class AnalyzeVideoQueue {
  constructor(@InjectQueue(ANALYZE_VIDEO_QUEUE_NAME) private queue: Queue) {}

  upload_video(data: UploadVideoData) {
    this.queue.add(ANALYZE_VIDEO_QUEUE_EVENTS.UPLOAD_VIDEO, data)
  }

  analyze_video(data: AnalyzeVideoData) {
    this.queue.add(ANALYZE_VIDEO_QUEUE_EVENTS.ANALYZE_VIDEO, data)
  }
}
