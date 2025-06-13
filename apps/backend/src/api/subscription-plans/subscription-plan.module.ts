import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../../models/subscription-plan.schema'
import { StripeService } from '../../services/stripe.service'
import { SubscriptionPlanController } from './subscription-plan.controller'
import { SubscriptionPlanService } from './subscription-plan.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
    ]),
  ],
  controllers: [SubscriptionPlanController],
  providers: [StripeService, SubscriptionPlanService],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
