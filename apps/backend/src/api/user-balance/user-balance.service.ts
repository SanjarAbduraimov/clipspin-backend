import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import {
  Context,
  DEFAULT_CONTEXT,
} from '../../common/decarators/context.decarator'
import { BaseService } from '../../common/services/base.service'
import { UserBalance } from '../../models/user-balance.schema'

@Injectable()
export class UserBalanceService extends BaseService<UserBalance> {
  constructor(
    @InjectModel(UserBalance.name)
    private readonly user_balance_model: Model<UserBalance>,
  ) {
    super(user_balance_model)
  }

  async setUpUserbalance(user: Types.ObjectId) {
    const user_balance = await this.user_balance_model.findOneAndUpdate(
      { user },
      { user },
      { upsert: true, new: true },
    )

    return user_balance
  }

  async addCredits(
    user: string | Types.ObjectId,
    amount: number,
    reason?: string,
  ) {
    return this.user_balance_model.findOneAndUpdate(
      { user: new Types.ObjectId(user) },
      {
        $inc: { credits: amount },
        $push: {
          credits_history: {
            amount,
            reason: reason,
            date: new Date(),
          },
        },
      },
      { new: true, upsert: true },
    )
  }

  async deductCredits(
    user_id: string | Types.ObjectId,
    amount: number,
    reason?: string,
  ) {
    const balance = await this.user_balance_model.findOne({
      user_id: new Types.ObjectId(user_id),
    })

    balance.credits -= amount
    balance.credits_history.push({
      amount: -amount,
      reason: reason || 'Project completed',
      date: new Date(),
    })

    await balance.save()

    return balance
  }

  async getBalance(
    user: string | Types.ObjectId,
    context: Context = DEFAULT_CONTEXT,
  ) {
    return this.user_balance_model
      .findOne({
        user: new Types.ObjectId(user),
      })
      .populate(context.populate)
  }
}
