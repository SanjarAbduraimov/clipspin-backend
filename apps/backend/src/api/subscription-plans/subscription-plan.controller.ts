import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  RawBodyRequest,
  Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { Public } from '../../common/decarators/public.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { BadRequestError } from '../../common/errors/bad-request.error'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { StripeService } from '../../services/stripe.service'
import { CreditPackService } from '../credit-packs/credit-pack.service'
import { ProfileService } from '../profile/profile.service'
import { UserSubscriptionService } from '../user-subscriptions/user-subscription.service'
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
    private readonly user_subscription_service: UserSubscriptionService,
    private readonly credit_pack_service: CreditPackService,
    private readonly stripe_service: StripeService,
    private readonly profile_service: ProfileService,
  ) {}

  @Get('/')
  @ResponseDTO(SubscriptionPlanResponseDTO)
  async getAll(@GetContext() ctx: Context) {
    const { data: subscription_plan, total } =
      await this.subscription_plan_service.list({}, ctx)

    return { data: subscription_plan, total }
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

    const user_subscription = await this.user_subscription_service.find({
      user: ctx.user._id,
      subscription_plan: subscription_plan._id,
    })

    if (user_subscription) {
      throw new BadRequestError(SubscriptionPlanController.resource_name, {
        id: id,
      })
    }

    const session = await this.stripe_service.create_subscription_session(
      subscription_plan.stripe_price_id,
      {
        user_id: ctx.user._id.toString(),
        subscription_plan_id: subscription_plan._id.toString(),
      },
    )

    return { data: session.url }
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
    let subscription_plan = await this.subscription_plan_service.retrieve(id)

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
  async delete(@Param('id') id: string) {
    const subscription_plan = await this.subscription_plan_service.retrieve(id)

    if (!subscription_plan) {
      throw new NotFoundError(SubscriptionPlanController.resource_name, {
        id: id,
      })
    }

    await this.subscription_plan_service.delete(id)

    return { data: null }
  }

  @Public()
  @Post('/webhook')
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const stripe_signature = req.headers['stripe-signature']

    const event = this.stripe_service.create_webhook_event(
      stripe_signature,
      req.rawBody,
    )

    if (event.type == 'checkout.session.completed') {
      const data = event.data.object

      if (data.payment_status != 'paid') return

      if (data.mode == 'subscription') {
        const { user_id, subscription_plan_id } = data.metadata

        const user = await this.profile_service.retrieve(user_id)

        await this.user_subscription_service.create_subscription(
          user,
          subscription_plan_id,
          {
            expires_at: new Date(new Date().getTime() + 30 * 24 * 3600 * 1000),
          },
        )
      } else if (data.mode == 'payment') {
        const { user_id, credit_pack_id } = data.metadata

        const user = await this.profile_service.retrieve(user_id)

        const credit_pack =
          await this.credit_pack_service.retrieve(credit_pack_id)

        await this.user_subscription_service.add_purchased_credits(
          user._id,
          credit_pack.credits,
        )
      }
    }
  }
}
