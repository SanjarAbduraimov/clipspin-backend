import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { SubscriptionPlan } from '../../models/subscription-plan.schema'

@Injectable()
export class SubscriptionPlanService extends BaseService<SubscriptionPlan> {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private readonly subscription_plan_model: Model<SubscriptionPlan>,
  ) {
    super(subscription_plan_model)
  }
}
