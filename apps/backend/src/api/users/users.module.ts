import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { User, UserSchema } from '../../models/user.schema'
import { UserSubscriptionModule } from '../user-subscriptions/user-subscription.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserSubscriptionModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
