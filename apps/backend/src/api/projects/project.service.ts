import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import {
  Project,
  ProjectErrorCause,
  ProjectStatus,
} from '../../models/project.schema'
import { UserSubscriptionService } from '../user-subscriptions/user-subscription.service'

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectModel(Project.name) private readonly project_model: Model<Project>,
    private readonly user_subscription_service: UserSubscriptionService,
  ) {
    super(project_model)
  }

  async failed(
    project_id: Types.ObjectId,
    error_cause?: ProjectErrorCause | string,
  ) {
    this.update(project_id, {
      status: ProjectStatus.FAILED,
      error_cause: error_cause || ProjectErrorCause.UNKNOWN_ERROR,
    })

    await this.return_used_credits(project_id)
  }

  async return_used_credits(project_id: Types.ObjectId) {
    const project = await this.retrieve(project_id)

    await this.user_subscription_service.increment_credits(
      project.user,
      project.credit_usage,
    )
  }
}
