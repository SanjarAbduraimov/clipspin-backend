import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  HeygenAvatar,
  HeygenAvatarSchema,
} from '../../models/heygen-avatar.schema'
import { HeygenAvatarController } from './heygen-avatar.controller'
import { HeygenAvatarService } from './heygen-avatar.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: HeygenAvatar.name,
        schema: HeygenAvatarSchema,
      },
    ]),
  ],
  controllers: [HeygenAvatarController],
  providers: [HeygenAvatarService],
  exports: [HeygenAvatarService],
})
export class HeygenAvatarModule {}
