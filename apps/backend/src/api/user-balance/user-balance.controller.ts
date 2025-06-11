import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { UserBalanceResponseDTO } from './dto/response.dto'
import { UserBalanceService } from './user-balance.service'

@ApiBearerAuth()
@ApiTags(UserBalanceController.resource_name)
@Controller('api/user-balance')
export class UserBalanceController {
  static resource_name = 'user-balance'
  constructor(private readonly user_balance_service: UserBalanceService) {}

  @Get('/my')
  @ResponseDTO(UserBalanceResponseDTO, { isArray: true })
  async getMyBalance(@GetContext() ctx: Context) {
    const balance = await this.user_balance_service.find({ user: ctx.user._id })

    return { data: balance }
  }
}
