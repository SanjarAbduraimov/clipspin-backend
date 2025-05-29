import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { InputQueueModule } from 'apps/queue/src/queus/input/input.module'

import { Project, ProjectSchema } from '../../models/project.schema'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
    ]),
    InputQueueModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
