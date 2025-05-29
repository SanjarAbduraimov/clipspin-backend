import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { User } from '../../models/user.schema'

@Injectable()
export class ProfileService extends BaseService<User> {
  constructor(
    @InjectModel(User.name) private readonly user_model: Model<User>,
  ) {
    super(user_model)
  }
}
