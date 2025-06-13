import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { StripeService } from '../../services/stripe.service'
import { CreateSubscriptionPlanDTO } from './dto/create.dto'
import { SubscriptionPlanResponseDTO } from './dto/response.dto'
import { UpdateSubscriptionPlanDTO } from './dto/update.dto'
import { SubscriptionPlanService } from './subscription-plan.service'

@ApiBearerAuth()
@ApiTags(SubscriptionPlanController.resource_name)
@Controller('/api/subscription-plans')
export class SubscriptionPlanController {
  static resource_name = 'subscription-plan'

  constructor(
    private readonly subscription_plan_service: SubscriptionPlanService,
    private readonly stripe_service: StripeService,
  ) {}

  @Get('/')
  @ResponseDTO(SubscriptionPlanResponseDTO)
  async getAll(@GetContext() ctx: Context) {
    const subscription_plan = await this.subscription_plan_service.list({}, ctx)

    return { data: subscription_plan }
  }

  @Get('/:id')
  @ResponseDTO(SubscriptionPlanResponseDTO)
  async get(@GetContext() ctx: Context, @Param('id') id: string) {
    const subscription_plan = await this.subscription_plan_service.find(
      { _id: id },
      ctx,
    )

    if (!subscription_plan) {
      throw new NotFoundError(SubscriptionPlanController.resource_name, {
        id: id,
      })
    }

    return { data: subscription_plan }
  }

  @Post('/:id/checkout')
  @ResponseDTO(SubscriptionPlanResponseDTO)
  async create_checkout_session(
    @GetContext() ctx: Context,
    @Param('id') id: string,
  ) {
    const subscription_plan = await this.subscription_plan_service.find(
      { _id: id },
      ctx,
    )

    if (!subscription_plan) {
      throw new NotFoundError(SubscriptionPlanController.resource_name, {
        id: id,
      })
    }

    const session = await this.stripe_service.create_checkout_session(
      subscription_plan.stripe_price_id,
      { user_id: ctx.user._id },
    )

    console.log(session)

    return { data: subscription_plan }
  }

  @Post('/')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(SubscriptionPlanResponseDTO)
  async create(@Body() body: CreateSubscriptionPlanDTO) {
    const subscription_plan = await this.subscription_plan_service.create(body)

    return { data: subscription_plan }
  }

  @Put('/:id')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(SubscriptionPlanResponseDTO)
  async update(
    @GetContext() ctx: Context,
    @Param('id') id: string,
    @Body() body: UpdateSubscriptionPlanDTO,
  ) {
    let subscription_plan = await this.subscription_plan_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!subscription_plan) {
      throw new NotFoundError(SubscriptionPlanController.resource_name, {
        id: id,
      })
    }

    subscription_plan = await this.subscription_plan_service.update(
      id,
      body,
      ctx,
    )

    return { data: subscription_plan }
  }

  @Delete('/:id')
  @AllowedRoles(UserRole.ADMIN)
  async delete(@Param('id') id: string, @GetContext() ctx: Context) {
    const subscription_plan = await this.subscription_plan_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!subscription_plan) {
      throw new NotFoundError(SubscriptionPlanController.resource_name, {
        id: id,
      })
    }

    await this.subscription_plan_service.delete(id)

    return { data: null }
  }
}
