import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

import { ProjectType } from 'apps/backend/src/models/project.schema'

export class CreateSubscriptionPlanDTO {
  @IsEnum(ProjectType)
  project_type: ProjectType

  @IsNumber()
  credit_cost: number

  @IsString()
  @IsOptional()
  description: string
}
