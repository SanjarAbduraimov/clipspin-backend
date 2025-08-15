import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { EntityStatus } from '../../common/enums/status.enum'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { CreateHeygenAvatarDTO } from './dto/create.dto'
import { HeygenAvatarResponseDTO } from './dto/response.dto'
import { UpdateHeygenAvatarDTO } from './dto/update.dto'
import { HeygenAvatarService } from './heygen-avatar.service'

@ApiBearerAuth()
@ApiTags(HeygenAvatarController.resource_name)
@Controller('/api/heygen-avatars')
export class HeygenAvatarController {
  static resource_name = 'heygen-avatar'

  constructor(private readonly heygen_avatar_service: HeygenAvatarService) {}

  @Get('/')
  @ResponseDTO(HeygenAvatarResponseDTO)
  async getAll(@GetContext() ctx: Context) {
    const { data: heygen_avatars, total } =
      await this.heygen_avatar_service.list(
        {
          status: EntityStatus.ACTIVE,
        },
        ctx,
      )

    return { data: heygen_avatars, total }
  }

  @Get('/:id')
  @ResponseDTO(HeygenAvatarResponseDTO)
  async get(@GetContext() ctx: Context, @Param('id') id: string) {
    const heygen_avatar = await this.heygen_avatar_service.find(
      { _id: id },
      ctx,
    )

    if (!heygen_avatar) {
      throw new NotFoundError(HeygenAvatarController.resource_name, {
        id: id,
      })
    }

    return { data: heygen_avatar }
  }

  @Post('/')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(HeygenAvatarResponseDTO)
  async create(@Body() body: CreateHeygenAvatarDTO) {
    const heygen_avatar = await this.heygen_avatar_service.create(body)

    return { data: heygen_avatar }
  }

  @Put('/:id')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(HeygenAvatarResponseDTO)
  async update(
    @GetContext() ctx: Context,
    @Param('id') id: string,
    @Body() body: UpdateHeygenAvatarDTO,
  ) {
    let heygen_avatar = await this.heygen_avatar_service.retrieve(id)

    if (!heygen_avatar) {
      throw new NotFoundError(HeygenAvatarController.resource_name, {
        id: id,
      })
    }

    heygen_avatar = await this.heygen_avatar_service.update(id, body, ctx)

    return { data: heygen_avatar }
  }

  @Delete('/:id')
  @AllowedRoles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const heygen_avatar = await this.heygen_avatar_service.retrieve(id)

    if (!heygen_avatar) {
      throw new NotFoundError(HeygenAvatarController.resource_name, {
        id: id,
      })
    }

    await this.heygen_avatar_service.delete(id)

    return { data: null }
  }
}
