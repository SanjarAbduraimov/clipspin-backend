import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { CreditUsage, ProjectType } from '../../models/project.schema'
import { UserSubscription } from '../../models/user-subscription.schema'
import { UserDocument } from '../../models/user.schema'
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
    const user_subscription = await this.user_subscription_model
      .findOne({ user })
      .populate('subscription_plan')

    return user_subscription
  }

  async create_subscription(
    user: UserDocument,
    subscription_plan_id: Types.ObjectId | string,
    data: Partial<UserSubscription>,
  ) {
    const subscription_plan =
      await this.subscription_plan_service.retrieve(subscription_plan_id)

    const user_subscription =
      await this.user_subscription_model.findOneAndUpdate(
        { user: user._id, subscription_plan: subscription_plan._id },
        {
          ...data,
          monthly_credits: {
            total: subscription_plan.credits,
            remaining: subscription_plan.credits,
          },
        },
        { upsert: true, new: true },
      )

    return user_subscription
  }

  async has_enough_credits(user: UserDocument, project_type: ProjectType) {
    const user_subscription = await this.find({ user: user._id })

    if (!user_subscription) {
      return false
    }

    const subscription_plan = await this.subscription_plan_service.retrieve(
      user_subscription.subscription_plan,
    )

    if (!subscription_plan) {
      return false
    }

    const project_cost = subscription_plan.project_type_prices.find(
      (item) => item.project_type == project_type,
    )

    const remainig_credits =
      user_subscription.monthly_credits.remaining ||
      0 + user_subscription.purchased_credits.remaining ||
      0

    if (remainig_credits < project_cost.credit_cost) {
      return false
    }

    return true
  }

  async add_purchased_credits(
    user_subscription_id: Types.ObjectId,
    amount: number,
  ) {
    await this.user_subscription_model.findByIdAndUpdate(user_subscription_id, {
      $inc: {
        'purchased_credits.total': amount,
        'purchased_credits.remaining': amount,
      },
    })
  }

  async decrement_credits(
    user_subscription_id: Types.ObjectId,
    usage: CreditUsage,
  ) {
    await this.user_subscription_model.findByIdAndUpdate(user_subscription_id, {
      $inc: {
        'monthly_credits.remaining': -usage.monthly,
        'purchased_credits.remaining': -usage.purchased,
      },
    })
  }

  async increment_credits(
    user_id: Types.ObjectId,
    usage: Omit<CreditUsage, 'total'>,
  ) {
    const user_subscription = await this.find({ user: user_id })

    await this.user_subscription_model.findByIdAndUpdate(
      user_subscription._id,
      {
        $inc: {
          'monthly_credits.remaining': usage.monthly,
          'purchased_credits.remaining': usage.purchased,
        },
      },
    )
  }
}
