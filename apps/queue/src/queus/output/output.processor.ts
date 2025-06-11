import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { v4 as uuidv4 } from 'uuid'

import {
  ProjectProgress,
  ProjectStatus,
} from 'apps/backend/src/models/project.schema'

import { ProjectService } from 'apps/backend/src/api/projects/project.service'
import { UserBalanceService } from 'apps/backend/src/api/user-balance/user-balance.service'

import { R2Service } from 'apps/backend/src/services/r2.service'

import {
  OUTPUT_QUEUE_EVENTS,
  OUTPUT_QUEUE_NAME,
  OutputQueueData,
} from './output.queue'

@Processor(OUTPUT_QUEUE_NAME)
export class OutputQueueProcessor {
  constructor(
    private readonly project_service: ProjectService,
    private readonly r2_service: R2Service,
    private readonly user_balance_service: UserBalanceService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data: `,
      job.data,
    )
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

  @Process(OUTPUT_QUEUE_EVENTS.SAVE)
  async save(job: Job<OutputQueueData>) {
    try {
      const project = await this.project_service.retrieve(job.data.project_id)

      await this.project_service.update(project._id, {
        progress: ProjectProgress.SAVING_RESULTS,
      })

      // CHECK: balance before any processing
      const user_balance = await this.user_balance_service.getBalance(
        project.user.toString(),
      )
      if (!user_balance || user_balance.credits < project.credit_cost) {
        await this.project_service.update(project._id, {
          status: ProjectStatus.FAILED,
        })
        return
      }

      const video_buffer = await this.download_video(job.data.video_url)

      const path = await this.save_video(video_buffer)

      const result = project.result || {}

      result.file_key = path

      await this.project_service.update(project._id, {
        result,
        progress: ProjectProgress.RESULTS_SAVED,
      })

      if (project.credit_cost) {
        await this.user_balance_service.deductCredits(
          project.user.toString(),
          project.credit_cost,
          `Project ${project._id} completed`,
        )
      }
    } catch (error) {
      console.log(error)

      await this.project_service.update(job.data.project_id, {
        status: ProjectStatus.FAILED,
      })
    }
  }
}
