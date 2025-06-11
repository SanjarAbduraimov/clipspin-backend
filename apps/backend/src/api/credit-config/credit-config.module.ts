import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  CreditConfig,
  CreditConfigSchema,
} from '../../models/credit-config.schema'
import { CreditConfigController } from './credit-config.controller'
import { CreditConfigService } from './credit-config.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CreditConfig.name,
        schema: CreditConfigSchema,
      },
    ]),
  ],
  controllers: [CreditConfigController],
  providers: [CreditConfigService],
  exports: [CreditConfigService],
})
export class CreditConfigModule {}
