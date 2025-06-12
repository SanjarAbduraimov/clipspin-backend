import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { MainQueue } from 'apps/queue/src/queus/main-queue/main-queue.queue'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { Public } from '../../common/decarators/public.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { ProjectStatus, ProjectType } from '../../models/project.schema'
import { CreditConfigService } from '../credit-config/credit-config.service'
import { UserBalanceService } from '../user-balance/user-balance.service'
import { CreateProjectDTO } from './dto/create.dto'
import { ProjectResponseDTO } from './dto/response.dto'
import { ProjectResultDTO } from './dto/result.dto'
import { UpdateProjectDTO } from './dto/update.dto'
import { ProjectService } from './project.service'

@ApiBearerAuth()
@ApiTags(ProjectController.resource_name)
@Controller('/api/projects')
export class ProjectController {
  static resource_name = 'project'
  constructor(
    private readonly project_service: ProjectService,
    private readonly queue: MainQueue,
    private readonly credit_config_service: CreditConfigService,
    private readonly user_balance_service: UserBalanceService,
  ) {}

  @Get('/')
  @ResponseDTO(ProjectResponseDTO)
  async getAll(@GetContext() ctx: Context) {
    const projects = await this.project_service.list(
      {
        user: ctx.user._id,
      },
      ctx,
    )

    return { data: projects }
  }

  @Get('/professional')
  @AllowedRoles(UserRole.EDITOR)
  @ResponseDTO(ProjectResponseDTO)
  async getEditorProjects(@GetContext() ctx: Context) {
    const projects = await this.project_service.list(
      {
        type: ProjectType.PROFESSIONAL,
      },
      ctx,
    )

    return { data: projects }
  }

  @Get('/:id')
  @ResponseDTO(ProjectResponseDTO)
  async get(@GetContext() ctx: Context, @Param('id') id: string) {
    const project = await this.project_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!project) {
      throw new NotFoundError(ProjectController.resource_name, {
        id: id,
      })
    }

    return { data: project }
  }

  @Post('/')
  @ResponseDTO(ProjectResponseDTO)
  async create(@Body() body: CreateProjectDTO, @GetContext() ctx: Context) {
    const credit_config = await this.credit_config_service.find({
      project_type: body.type,
    })

    //credit
    const credit_cost = credit_config.credit_cost

    const user_balance = await this.user_balance_service.getBalance(
      ctx.user._id,
    )

    if (!user_balance) {
      throw new NotFoundException()
    }

    if (user_balance.credits < credit_cost) {
      throw new BadRequestException('Insufficent balance')
    }

    const pending_projects = await this.project_service.list(
      {
        user: ctx.user._id,
        status: { $in: [ProjectStatus.QUEUED, ProjectStatus.IN_PROGRESS] },
      },
      ctx,
    )

    const total_pending_credits = pending_projects.reduce(
      (acc, p) => acc + (p.credit_cost || 0),
      0,
    )

    const available_credits = user_balance.credits - total_pending_credits

    if (available_credits < credit_cost) {
      throw new BadRequestException(
        'Insufficient credits considering pending projects',
      )
    }

    const project = await this.project_service.create({
      ...body,
      user: ctx.user?._id,
      credit_cost: credit_cost,
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

    return { data: project }
  }

  @Post('/:id/result')
  @AllowedRoles(UserRole.EDITOR)
  @ResponseDTO(ProjectResponseDTO)
  async submit_result(
    @GetContext() ctx: Context,
    @Param('id') id: string,
    @Body() body: ProjectResultDTO,
  ) {
    let project = await this.project_service.find({ _id: id }, ctx)

    if (!project) {
      throw new NotFoundError(ProjectController.resource_name, {
        id: id,
      })
    }

    project = await this.project_service.update(
      id,
      { result: body, status: ProjectStatus.COMPLETED },
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
    let project = await this.project_service.find(
      { _id: id, user: ctx.user._id },
      ctx,
    )

    if (!project) {
      throw new NotFoundError(ProjectController.resource_name, {
        id: id,
      })
    }

    project = await this.project_service.update(id, body, ctx)

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
    if (body.event_type == 'avatar_video.success') {
      const project = await this.project_service.retrieve(
        body.event_data.callback_id,
      )

      if (project) {
        const video_url = body.event_data.url

        this.queue.output({ project_id: project._id, video_url })
      }
    }

    return {}
  }
}
