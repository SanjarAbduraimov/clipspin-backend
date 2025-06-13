import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { UserSubscription } from '../../models/user-subscription.schema'
import { SubscriptionPlanService } from '../subscription-plans/subscription-plan.service'

@Injectable()
export class UserSubscriptionService extends BaseService<UserSubscription> {
  constructor(
    @InjectModel(UserSubscription.name)
    private readonly user_subscription_model: Model<UserSubscription>,
    private readonly subscription_plan_service: SubscriptionPlanService,
  ) {
    super(user_subscription_model)
  }

  async get_user_subscription(user: Types.ObjectId) {
    const user_subscription = await this.find({ user })

    return user_subscription
  }
}
