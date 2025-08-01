import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  HeygenVoice,
  HeygenVoiceSchema,
} from '../../models/heygen-voice.schema'
import { HeygenVoiceController } from './heygen-voice.controller'
import { HeygenVoiceService } from './heygen-voice.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: HeygenVoice.name,
        schema: HeygenVoiceSchema,
      },
    ]),
  ],
  controllers: [HeygenVoiceController],
  providers: [HeygenVoiceService],
  exports: [HeygenVoiceService],
})
export class HeygenVoiceModule {}
