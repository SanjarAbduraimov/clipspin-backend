import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { User, UserSchema } from '../../models/user.schema'
import { UserSubscriptionModule } from '../user-subscriptions/user-subscription.module'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserSubscriptionModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
