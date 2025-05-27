import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Context, GetContext } from 'src/common/decarators/context.decarator'
import { ResponseDTO } from 'src/common/decarators/response.decarator'
import { NotFoundError } from 'src/common/errors/not-fount.error'

import { CreateProjectDTO } from './dto/create.dto'
import { ProjectResponseDTO } from './dto/response.dto'
import { UpdateProjectDTO } from './dto/update.dto'
import { ProjectService } from './project.service'

@ApiBearerAuth()
@ApiTags(ProjectController.resource_name)
@Controller('/api/projects')
export class ProjectController {
  static resource_name = 'project'
  constructor(private readonly project_service: ProjectService) {}

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
    const project = await this.project_service.create({
      ...body,
      user: ctx.user?._id,
    })

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
}
