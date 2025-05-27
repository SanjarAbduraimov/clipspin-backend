import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Project } from 'src/models/project.schema'

import { BaseService } from 'src/common/services/base.service'

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectModel(Project.name) private readonly project_model: Model<Project>,
  ) {
    super(project_model)
  }
}
