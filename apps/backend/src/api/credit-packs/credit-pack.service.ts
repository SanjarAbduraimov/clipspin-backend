import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { CreditPack } from '../../models/credit-pack.schema'

@Injectable()
export class CreditPackService extends BaseService<CreditPack> {
  constructor(
    @InjectModel(CreditPack.name)
    private readonly credit_pack_model: Model<CreditPack>,
  ) {
    super(credit_pack_model)
  }
}
