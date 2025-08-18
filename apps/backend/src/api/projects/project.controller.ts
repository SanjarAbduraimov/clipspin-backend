import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'
import { isValidObjectId } from 'mongoose'

import { MainQueue } from 'apps/queue/src/queus/main-queue/main-queue.queue'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { Public } from '../../common/decarators/public.decarator'
import { QueryFilter } from '../../common/decarators/query-filter.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { User } from '../../common/decarators/user.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { BadRequestError } from '../../common/errors/bad-request.error'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { HeygenAvatarDocument } from '../../models/heygen-avatar.schema'
import { ProjectStatus, ProjectType } from '../../models/project.schema'
import { UserDocument } from '../../models/user.schema'
import { HeygenAvatarController } from '../heygen-avatars/heygen-avatar.controller'
import { HeygenAvatarService } from '../heygen-avatars/heygen-avatar.service'
import { HeygenVoiceController } from '../heygen-voices/heygen-voice.controller'
import { HeygenVoiceService } from '../heygen-voices/heygen-voice.service'
import { SubscriptionPlanController } from '../subscription-plans/subscription-plan.controller'
import { SubscriptionPlanService } from '../subscription-plans/subscription-plan.service'
import { UserSubscriptionController } from '../user-subscriptions/user-subscription.controller'
import { UserSubscriptionService } from '../user-subscriptions/user-subscription.service'
import { CreateProjectDTO } from './dto/create.dto'
import { ProjectResponseDTO } from './dto/response.dto'
import { ProjectOutputDTO } from './dto/result.dto'
import { UpdateProjectDTO } from './dto/update.dto'
import { ProjectService } from './project.service'

@ApiBearerAuth()
@ApiTags(ProjectController.resource_name)
@Controller('/api/projects')
export class ProjectController {
  static resource_name = 'project'
  constructor(
    private readonly project_service: ProjectService,
    private readonly user_subscription_service: UserSubscriptionService,
    private readonly subscription_plan_service: SubscriptionPlanService,
    private readonly heygen_voice_service: HeygenVoiceService,
    private readonly heygen_avatar_service: HeygenAvatarService,
    private readonly queue: MainQueue,
  ) {}

  @Get('/')
  @ResponseDTO(ProjectResponseDTO)
  async getAll(@GetContext() ctx: Context) {
    const { data: projects, total } = await this.project_service.list(
      {
        user: ctx.user._id,
      },
      ctx,
    )

    return { data: projects, total }
  }

  @Public()
  @Get('/list')
  @AllowedRoles(UserRole.ADMIN)
  @ResponseDTO(ProjectResponseDTO)
  @ApiQuery({ name: '_limit', type: Number, required: false, example: 10 })
  @ApiQuery({ name: '_page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: '_skip', type: Number, required: false, example: 0 })
  async list(@GetContext() ctx: Context, @QueryFilter() filter: any) {
    const { data: projects, total } = await this.project_service.list(filter, {
      ...ctx,
      populate: 'user avatar',
    })

    return { data: projects, total }
  }

  @Get('/professional')
  @AllowedRoles(UserRole.EDITOR)
  @ResponseDTO(ProjectResponseDTO)
  async getEditorProjects(@GetContext() ctx: Context) {
    const { data: projects, total } = await this.project_service.list(
      {
        type: ProjectType.PROFESSIONAL,
      },
      ctx,
    )

    return { data: projects, total }
  }

  @Get('/:id')
  @ResponseDTO(ProjectResponseDTO)
  async get(@GetContext() ctx: Context, @Param('id') id: string) {
    const project = await this.project_service.retrieve(id, ctx)

    if (!project) {
      throw new NotFoundError(ProjectController.resource_name, {
        id: id,
      })
    }

    return { data: project }
  }

  @Post('/')
  @ResponseDTO(ProjectResponseDTO)
  async create(
    @Body() body: CreateProjectDTO,
    @GetContext() ctx: Context,
    @User() user: UserDocument,
  ) {
    let avatar: HeygenAvatarDocument

    const talking_head_validation =
      body.type == ProjectType.TALKING_HEAD && !isValidObjectId(body.avatar)
    if (talking_head_validation) {
      throw new BadRequestError(ProjectController.resource_name, {
        id: body.avatar,
      })
    }

    if (body.avatar) {
      avatar = await this.heygen_avatar_service.retrieve(body.avatar)

      if (!avatar) {
        throw new NotFoundError(HeygenAvatarController.resource_name, {
          id: body.avatar,
        })
      }
    }
    const user_subscription = await this.user_subscription_service.find({
      user: user._id,
    })

    if (!user_subscription) {
      throw new NotFoundError(UserSubscriptionController.resource_name, {
        user: user._id,
      })
    }

    const subscription_plan = await this.subscription_plan_service.retrieve(
      user_subscription.subscription_plan,
    )

    if (!subscription_plan) {
      throw new NotFoundError(SubscriptionPlanController.resource_name, {
        id: user_subscription.subscription_plan,
      })
    }

    const project_cost = subscription_plan.project_type_prices.find(
      (item) => item.project_type == body.type,
    )

    const credit_cost = project_cost.credit_cost
    const remaining_monthly_credits =
      user_subscription.monthly_credits.remaining
    const remaining_purchased_credits =
      user_subscription.purchased_credits.remaining

    const monthly_used = Math.min(remaining_monthly_credits, credit_cost)
    const remaining = credit_cost - monthly_used
    const purchased_used = Math.min(remaining_purchased_credits, remaining)

    const total_used = monthly_used + purchased_used

    if (total_used < credit_cost) {
      throw new Error('Not enough total credits to cover the amount')
    }

    const credit_usage = {
      total: total_used,
      monthly: monthly_used,
      purchased: purchased_used,
    }

    await this.user_subscription_service.decrement_credits(
      user_subscription._id,
      credit_usage,
    )

    const project = await this.project_service.create({
      ...body,
      user: ctx.user?._id,
      avatar: avatar?._id,
      credit_usage,
    })

    this.queue.analyze({ project_id: project._id })

    return { data: project }
  }

  @Post('/:id/generate')
  @ResponseDTO(ProjectResponseDTO)
  async generate(@GetContext() ctx: Context, @Param('id') id: string) {
    const project = await this.project_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!project) {
      throw new NotFoundError(ProjectController.resource_name, {
        id: id,
      })
    }

    this.queue.generate({ project_id: project._id })
    this.queue.generate_content({ project_id: project._id })

    return { data: project }
  }

  @Post('/:id/result')
  @AllowedRoles(UserRole.EDITOR)
  @ResponseDTO(ProjectResponseDTO)
  async submit_result(
    @GetContext() ctx: Context,
    @Param('id') id: string,
    @Body() body: ProjectOutputDTO,
  ) {
    let project = await this.project_service.find({ _id: id }, ctx)

    if (!project) {
      throw new NotFoundError(ProjectController.resource_name, {
        id: id,
      })
    }

    project = await this.project_service.update(
      id,
      { output: body, status: ProjectStatus.COMPLETED },
      ctx,
    )

    return { data: project }
  }

  @Put('/:id')
  @ResponseDTO(ProjectResponseDTO)
  async update(
    @GetContext() ctx: Context,
    @Param('id') id: string,
    @Body() body: UpdateProjectDTO,
  ) {
    let avatar: HeygenAvatarDocument

    if (body.avatar) {
      avatar = await this.heygen_avatar_service.retrieve(body.avatar)

      if (!avatar) {
        throw new NotFoundError(HeygenVoiceController.resource_name, {
          id: body.avatar,
        })
      }
    }

    let project = await this.project_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!project) {
      throw new NotFoundError(ProjectController.resource_name, {
        id: id,
      })
    }

    project = await this.project_service.update(
      id,
      {
        ...body,
        avatar: avatar?._id,
      },
      ctx,
    )

    return { data: project }
  }

  @Delete('/:id')
  async delete(@Param('id') id: string, @GetContext() ctx: Context) {
    const project = await this.project_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!project) {
      throw new NotFoundError(ProjectController.resource_name, {
        id: id,
      })
    }

    await this.project_service.delete(id)

    return { data: null }
  }

  @Public()
  @Post('/heygen/callback')
  @ResponseDTO(ProjectResponseDTO)
  async heygen_callback(@Body() body: any) {
    const project_id = body.event_data?.callback_id

    if (body.event_type == 'avatar_video.success') {
      const project = await this.project_service.retrieve(project_id)

      if (project) {
        const video_url = body.event_data.url

        this.queue.output({ project_id: project._id, video_url })
      }
      return
    }

    await this.project_service.update(project_id, {
      status: ProjectStatus.FAILED,
      error_cause: body.event_data?.msg,
    })

    return {}
  }
}
