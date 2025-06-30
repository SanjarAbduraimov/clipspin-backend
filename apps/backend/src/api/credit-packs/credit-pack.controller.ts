import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { StripeService } from '../../services/stripe.service'
import { CreditPackService } from './credit-pack.service'
import { CreateCreditPackDTO } from './dto/create.dto'
import { CreditPackResponseDTO } from './dto/response.dto'
import { UpdateCreditPackDTO } from './dto/update.dto'

@ApiBearerAuth()
@ApiTags(CreditPackController.resource_name)
@Controller('/api/credit-packs')
export class CreditPackController {
  static resource_name = 'credit-packs'

  constructor(
    private readonly credit_pack_service: CreditPackService,
    private readonly stripe_service: StripeService,
  ) {}

  @Get('/')
  @ResponseDTO(CreditPackResponseDTO)
  async getAll(@GetContext() ctx: Context) {
    const subscription_plan = await this.credit_pack_service.list({}, ctx)

    return { data: subscription_plan }
  }

  @Get('/:id')
  @ResponseDTO(CreditPackResponseDTO)
  async get(@GetContext() ctx: Context, @Param('id') id: string) {
    const credit_pack = await this.credit_pack_service.find({ _id: id }, ctx)

    if (!credit_pack) {
      throw new NotFoundError(CreditPackController.resource_name, {
        id: id,
      })
    }

    return { data: credit_pack }
  }

  @Post('/:id/checkout')
  @ResponseDTO(CreditPackResponseDTO)
  async create_checkout_session(
    @GetContext() ctx: Context,
    @Param('id') id: string,
  ) {
    const credit_pack = await this.credit_pack_service.retrieve(id)

    if (!credit_pack) {
      throw new NotFoundError(CreditPackController.resource_name, {
        id: id,
      })
    }

    const session = await this.stripe_service.create_credit_purchase_session(
      credit_pack.stripe_price_id,
      {
        user_id: ctx.user._id.toString(),
        credit_pack_id: credit_pack._id.toString(),
      },
    )

    return { data: session.url }
  }

  @Post('/')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(CreditPackResponseDTO)
  async create(@Body() body: CreateCreditPackDTO) {
    const credit_pack = await this.credit_pack_service.create(body)

    return { data: credit_pack }
  }

  @Put('/:id')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(CreditPackResponseDTO)
  async update(
    @GetContext() ctx: Context,
    @Param('id') id: string,
    @Body() body: UpdateCreditPackDTO,
  ) {
    let credit_pack = await this.credit_pack_service.retrieve(id)

    if (!credit_pack) {
      throw new NotFoundError(CreditPackController.resource_name, {
        id: id,
      })
    }

    credit_pack = await this.credit_pack_service.update(id, body, ctx)

    return { data: credit_pack }
  }

  @Delete('/:id')
  @AllowedRoles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const credit_pack = await this.credit_pack_service.retrieve(id)

    if (!credit_pack) {
      throw new NotFoundError(CreditPackController.resource_name, {
        id: id,
      })
    }

    await this.credit_pack_service.delete(id)

    return { data: null }
  }
}
