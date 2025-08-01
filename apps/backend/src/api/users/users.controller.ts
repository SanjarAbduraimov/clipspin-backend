import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { UpdateCreditsDTO } from './dto/update-credits.dto'
import { UpdateRoleDTO } from './dto/update-role.dto'
import { UserResponseDTO } from './dto/user-response.dto'
import { UsersService } from './users.service'

@ApiBearerAuth()
@ApiTags('users')
@Controller('/api/users')
export class UsersController {
  constructor(private readonly users_service: UsersService) {}

  @Get('/')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(UserResponseDTO, { isArray: true })
  async list(@GetContext() ctx: Context) {
    const { data: users, total } = await this.users_service.list({}, ctx)

    return { data: users, total }
  }

  @Patch('/:id/role')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(UserResponseDTO)
  async updateRole(@Param('id') id: string, @Body() { role }: UpdateRoleDTO) {
    const user = await this.users_service.update_role(id, role)

    return { data: user }
  }

  @Patch('/:id/credits')
  @AllowedRoles(UserRole.ADMIN)
  async updateCredits(
    @Param('id') id: string,
    @Body() { operation, amount }: UpdateCreditsDTO,
  ) {
    const user_subscription = await this.users_service.update_purchased_credits(
      id,
      operation,
      amount,
    )

    return { data: user_subscription }
  }
}
