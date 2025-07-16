import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { UserRole } from '../../common/enums/role.enum'
import { BaseService } from '../../common/services/base.service'
import { User } from '../../models/user.schema'

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(@InjectModel(User.name) user_model: Model<User>) {
    super(user_model)
  }

  async update_role(id: string, role: UserRole) {
    return this.update(id, { role })
  }
}
