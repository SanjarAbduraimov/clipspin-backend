import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { INPUT_QUEUE_NAME, InputQueue } from './input.queue'

@Module({
  imports: [
    BullModule.registerQueue({
      name: INPUT_QUEUE_NAME,
    }),
  ],
  providers: [InputQueue],
  exports: [InputQueue],
})
export class InputQueueModule {}
