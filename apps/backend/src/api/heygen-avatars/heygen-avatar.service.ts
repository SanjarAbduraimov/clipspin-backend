import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { HeygenAvatar } from '../../models/heygen-avatar.schema'

@Injectable()
export class HeygenAvatarService extends BaseService<HeygenAvatar> {
  constructor(
    @InjectModel(HeygenAvatar.name)
    private readonly heygen_avatar_model: Model<HeygenAvatar>,
  ) {
    super(heygen_avatar_model)
  }
}
