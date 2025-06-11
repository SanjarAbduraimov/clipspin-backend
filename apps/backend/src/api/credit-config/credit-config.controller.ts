import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { CreditConfigService } from './credit-config.service'
import { CreateCreditConfigDTO } from './dto/create.dto'
import { CreditConfigResponseDTO } from './dto/response.dto'
import { UpdateCreditConfigDTO } from './dto/update.dto'

@ApiBearerAuth()
@ApiTags(CreditConfigController.resource_name)
@Controller('api/credit-config')
export class CreditConfigController {
  static resource_name = 'credit-config'

  constructor(private readonly credit_config_service: CreditConfigService) {}

  @Get('/')
  @ResponseDTO(CreditConfigResponseDTO)
  async getAll(@GetContext() ctx: Context) {
    const credit_config = await this.credit_config_service.list({}, ctx)

    return { data: credit_config }
  }

  @Get('/:id')
  @ResponseDTO(CreditConfigResponseDTO)
  async get(@GetContext() ctx: Context, @Param('id') id: string) {
    const credit_config = await this.credit_config_service.find(
      { _id: id },
      ctx,
    )

    if (!credit_config) {
      throw new NotFoundError(CreditConfigController.resource_name, {
        id: id,
      })
    }

    return { data: credit_config }
  }

  @Post('/')
  @ResponseDTO(CreditConfigResponseDTO)
  async create(@Body() body: CreateCreditConfigDTO) {
    const credit_config = await this.credit_config_service.create({
      ...body,
    })

    return { data: credit_config }
  }

  @Put('/:id')
  @ResponseDTO(CreditConfigResponseDTO)
  async update(
    @GetContext() ctx: Context,
    @Param('id') id: string,
    @Body() body: UpdateCreditConfigDTO,
  ) {
    let credit_config = await this.credit_config_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!credit_config) {
      throw new NotFoundError(CreditConfigController.resource_name, {
        id: id,
      })
    }

    credit_config = await this.credit_config_service.update(id, body, ctx)

    return { data: credit_config }
  }

  @Delete('/:id')
  async delete(@Param('id') id: string, @GetContext() ctx: Context) {
    const credit_config = await this.credit_config_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!credit_config) {
      throw new NotFoundError(CreditConfigController.resource_name, {
        id: id,
      })
    }

    await this.credit_config_service.delete(id)

    return { data: null }
  }
}
