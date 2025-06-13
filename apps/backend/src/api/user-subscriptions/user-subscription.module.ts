import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  UserSubscription,
  UserSubscriptionSchema,
} from '../../models/user-subscription.schema'
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
    SubscriptionPlanModule,
  ],
  providers: [UserSubscriptionService],
  controllers: [UserSubscriptionController],
  exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}
