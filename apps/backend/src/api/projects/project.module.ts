import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MainQueueModule } from 'apps/queue/src/queus/main-queue/main-queue.module'

import { Project, ProjectSchema } from '../../models/project.schema'
import { CreditConfigModule } from '../credit-config/credit-config.module'
import { UserBalanceModule } from '../user-balance/user-balance.module'
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
    MainQueueModule,
    CreditConfigModule,
    UserBalanceModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
