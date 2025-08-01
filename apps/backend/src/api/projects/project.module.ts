import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MainQueueModule } from 'apps/queue/src/queus/main-queue/main-queue.module'

import { Project, ProjectSchema } from '../../models/project.schema'
import { HeygenVoiceModule } from '../heygen-voices/heygen-voice.module'
import { SubscriptionPlanModule } from '../subscription-plans/subscription-plan.module'
import { UserSubscriptionModule } from '../user-subscriptions/user-subscription.module'
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
    SubscriptionPlanModule,
    UserSubscriptionModule,
    HeygenVoiceModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
