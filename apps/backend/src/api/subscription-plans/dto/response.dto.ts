import { Expose, Transform } from 'class-transformer'

import { ProjectType } from 'apps/backend/src/models/project.schema'

import { transform_object_id } from 'apps/backend/src/common/utils/transform-object-id'

export class SubscriptionPlanResponseDTO {
  @Expose()
  @Transform(transform_object_id)
  _id: string

  @Expose()
  project_type: ProjectType

  @Expose()
  credit_cost: number

  @Expose()
  description: string
}
