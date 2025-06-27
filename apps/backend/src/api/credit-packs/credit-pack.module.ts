import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CreditPack, CreditPackSchema } from '../../models/credit-pack.schema'
import { StripeService } from '../../services/stripe.service'
import { CreditPackController } from './credit-pack.controller'
import { CreditPackService } from './credit-pack.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CreditPack.name,
        schema: CreditPackSchema,
      },
    ]),
  ],
  controllers: [CreditPackController],
  providers: [StripeService, CreditPackService],
  exports: [CreditPackService],
})
export class CreditPackModule {}
