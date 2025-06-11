import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  UserBalance,
  UserBalanceSchema,
} from '../../models/user-balance.schema'
import { UserBalanceController } from './user-balance.controller'
import { UserBalanceService } from './user-balance.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserBalance.name,
        schema: UserBalanceSchema,
      },
    ]),
  ],
  providers: [UserBalanceService],
  controllers: [UserBalanceController],
  exports: [UserBalanceService],
})
export class UserBalanceModule {}
