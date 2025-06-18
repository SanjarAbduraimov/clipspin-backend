import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { UserSubscriptionModule } from 'apps/backend/src/api/user-subscriptions/user-subscription.module'

import { R2Service } from 'apps/backend/src/services/r2.service'

import { OutputQueueProcessor } from './output.processor'
import { OUTPUT_QUEUE_NAME, OutputQueue } from './output.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: OUTPUT_QUEUE_NAME,
    }),
    UserSubscriptionModule,
  ],
  providers: [OutputQueue, R2Service, OutputQueueProcessor],
  exports: [OutputQueue],
})
export class OutputQueueModule {}
