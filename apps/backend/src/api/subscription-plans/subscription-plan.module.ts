import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../../models/subscription-plan.schema'
import { StripeService } from '../../services/stripe.service'
import { CreditPackModule } from '../credit-packs/credit-pack.module'
import { ProfileModule } from '../profile/profile.module'
import { UserSubscriptionModule } from '../user-subscriptions/user-subscription.module'
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
    forwardRef(() => UserSubscriptionModule),
    forwardRef(() => ProfileModule),
    CreditPackModule,
  ],
  controllers: [SubscriptionPlanController],
  providers: [StripeService, SubscriptionPlanService],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
