import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  UserBalance,
  UserBalanceSchema,
} from '../../models/user-balance.schema'
import { CreditConfigModule } from '../credit-config/credit-config.module'
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
    CreditConfigModule,
  ],
  providers: [UserBalanceService],
  controllers: [UserBalanceController],
  exports: [UserBalanceService],
})
export class UserBalanceModule {}
