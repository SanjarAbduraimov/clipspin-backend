import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { BaseService } from '../../common/services/base.service'
import { Project } from '../../models/project.schema'

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectModel(Project.name) private readonly project_model: Model<Project>,
  ) {
    super(project_model)
  }
}
