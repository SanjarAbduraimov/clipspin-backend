import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import {
  Context,
  DEFAULT_CONTEXT,
} from '../../common/decarators/context.decarator'
import { BaseService } from '../../common/services/base.service'
import { ProjectStatus, ProjectType } from '../../models/project.schema'
import { UserBalance } from '../../models/user-balance.schema'
import { CreditConfigService } from '../credit-config/credit-config.service'
import { ProjectService } from '../projects/project.service'

@Injectable()
export class UserBalanceService extends BaseService<UserBalance> {
  constructor(
    @InjectModel(UserBalance.name)
    private readonly user_balance_model: Model<UserBalance>,
    private readonly credit_config_service: CreditConfigService,
    private readonly project_service: ProjectService,
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
      user: new Types.ObjectId(user_id),
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

  async ensureUserHasEnoughCredits(
    user_id: Types.ObjectId,
    project_type: ProjectType,
  ): Promise<number> {
    const [user_balance, credit_config, pending_projects] = await Promise.all([
      this.getBalance(user_id),
      this.credit_config_service.find({ project_type }),
      this.project_service.list({
        user: user_id,
        status: { $in: [ProjectStatus.QUEUED, ProjectStatus.IN_PROGRESS] },
      }),
    ])

    if (!user_balance) throw new NotFoundException('User balance not found')
    if (!credit_config) throw new NotFoundException('Credit config not found')

    const credit_cost = credit_config.credit_cost

    const total_pending_credits = pending_projects.reduce(
      (acc, p) => acc + (p.credit_cost || 0),
      0,
    )

    const available_credits = user_balance.credits - total_pending_credits

    if (available_credits < credit_cost) {
      throw new BadRequestException(
        'Insufficient credits considering pending projects',
      )
    }

    return credit_cost
  }
}
