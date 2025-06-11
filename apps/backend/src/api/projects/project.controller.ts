import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { MainQueue } from 'apps/queue/src/queus/main-queue/main-queue.queue'

import { Context, GetContext } from '../../common/decarators/context.decarator'
import { Public } from '../../common/decarators/public.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AllowedRoles } from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { ProjectStatus, ProjectType } from '../../models/project.schema'
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
  async create(@Body() body: CreateProjectDTO, @GetContext() ctx: Context) {
    const project = await this.project_service.create({
      ...body,
      user: ctx.user?._id,
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
