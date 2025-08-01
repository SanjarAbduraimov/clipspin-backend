import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { UserRole } from '../../common/enums/role.enum'
import { BaseService } from '../../common/services/base.service'
import { User } from '../../models/user.schema'
import { UserSubscriptionService } from '../user-subscriptions/user-subscription.service'
import { CreditOperation } from './dto/update-credits.dto'

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectModel(User.name) user_model: Model<User>,
    private readonly user_subscription_service: UserSubscriptionService,
  ) {
    super(user_model)
  }

  async update_role(id: string, role: UserRole) {
    return this.update(id, { role })
  }

  async update_purchased_credits(
    user_id: string,
    operation: CreditOperation,
    amount: number,
  ) {
    const user = await this.retrieve(user_id)
    const user_subscription = await this.user_subscription_service.find({
      user: user._id,
    })

    if (!user_subscription) {
      throw new Error('User subscription not found')
    }

    const increment_amount = operation === CreditOperation.ADD ? amount : -amount

    await this.user_subscription_service.update(user_subscription._id, {
      $inc: {
        'purchased_credits.total': increment_amount,
        'purchased_credits.remaining': increment_amount,
      },
    })

    return this.user_subscription_service.retrieve(user_subscription._id)
  }
}
