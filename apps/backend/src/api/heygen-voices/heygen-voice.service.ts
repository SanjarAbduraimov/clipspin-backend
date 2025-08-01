import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { HeygenVoice } from '../../models/heygen-voice.schema'

@Injectable()
export class HeygenVoiceService extends BaseService<HeygenVoice> {
  constructor(
    @InjectModel(HeygenVoice.name)
    private readonly heygen_voice_model: Model<HeygenVoice>,
  ) {
    super(heygen_voice_model)
  }
}

