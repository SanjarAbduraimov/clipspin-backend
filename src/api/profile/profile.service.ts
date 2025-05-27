import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from 'src/models/user.schema'

import { BaseService } from 'src/common/services/base.service'

@Injectable()
export class ProfileService extends BaseService<User> {
  constructor(
    @InjectModel(User.name) private readonly user_model: Model<User>,
  ) {
    super(user_model)
  }
}
