import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { MAIN_QUEUE_NAME, MainQueue } from './main-queue.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: MAIN_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 15000,
        },
      },
    }),
  ],
  providers: [MainQueue],
  exports: [MainQueue],
})
export class MainQueueModule {}
