import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { CreditConfig } from '../../models/credit-config.schema'

@Injectable()
export class CreditConfigService extends BaseService<CreditConfig> {
  constructor(
    @InjectModel(CreditConfig.name)
    private readonly credit_config_model: Model<CreditConfig>,
  ) {
    super(credit_config_model)
  }
}
