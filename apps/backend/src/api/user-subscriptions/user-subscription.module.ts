import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  UserSubscription,
  UserSubscriptionSchema,
} from '../../models/user-subscription.schema'
import { StripeService } from '../../services/stripe.service'
import { CreditPackModule } from '../credit-packs/credit-pack.module'
import { SubscriptionPlanModule } from '../subscription-plans/subscription-plan.module'
import { UserSubscriptionController } from './user-subscription.controller'
import { UserSubscriptionService } from './user-subscription.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserSubscription.name,
        schema: UserSubscriptionSchema,
      },
    ]),
    forwardRef(() => SubscriptionPlanModule),
    CreditPackModule,
  ],
  providers: [UserSubscriptionService, StripeService],
  controllers: [UserSubscriptionController],
  exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}
