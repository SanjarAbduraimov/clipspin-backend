import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { CreateHeygenVoiceDTO } from './dto/create.dto'
import { HeygenVoiceResponseDTO } from './dto/response.dto'
import { UpdateHeygenVoiceDTO } from './dto/update.dto'
import { HeygenVoiceService } from './heygen-voice.service'

@ApiBearerAuth()
@ApiTags(HeygenVoiceController.resource_name)
@Controller('/api/heygen-voices')
export class HeygenVoiceController {
  static resource_name = 'heygen-voice'

  constructor(private readonly heygen_voice_service: HeygenVoiceService) {}

  @Get('/')
  @ResponseDTO(HeygenVoiceResponseDTO)
  async getAll(@GetContext() ctx: Context) {
    const { data: heygen_voices, total } = await this.heygen_voice_service.list(
      {},
      ctx,
    )

    return { data: heygen_voices, total }
  }

  @Get('/:id')
  @ResponseDTO(HeygenVoiceResponseDTO)
  async get(@GetContext() ctx: Context, @Param('id') id: string) {
    const heygen_voice = await this.heygen_voice_service.find({ _id: id }, ctx)

    if (!heygen_voice) {
      throw new NotFoundError(HeygenVoiceController.resource_name, {
        id: id,
      })
    }

    return { data: heygen_voice }
  }

  @Post('/')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(HeygenVoiceResponseDTO)
  async create(@Body() body: CreateHeygenVoiceDTO) {
    const heygen_voice = await this.heygen_voice_service.create(body)

    return { data: heygen_voice }
  }

  @Put('/:id')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(HeygenVoiceResponseDTO)
  async update(
    @GetContext() ctx: Context,
    @Param('id') id: string,
    @Body() body: UpdateHeygenVoiceDTO,
  ) {
    let heygen_voice = await this.heygen_voice_service.retrieve(id)

    if (!heygen_voice) {
      throw new NotFoundError(HeygenVoiceController.resource_name, {
        id: id,
      })
    }

    heygen_voice = await this.heygen_voice_service.update(id, body, ctx)

    return { data: heygen_voice }
  }

  @Delete('/:id')
  @AllowedRoles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const heygen_voice = await this.heygen_voice_service.retrieve(id)

    if (!heygen_voice) {
      throw new NotFoundError(HeygenVoiceController.resource_name, {
        id: id,
      })
    }

    await this.heygen_voice_service.delete(id)

    return { data: null }
  }
}
