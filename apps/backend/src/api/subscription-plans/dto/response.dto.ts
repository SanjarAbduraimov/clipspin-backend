import { Expose, Transform, Type } from 'class-transformer'

import { ProjectType } from 'apps/backend/src/models/project.schema'

import { transform_object_id } from 'apps/backend/src/common/utils/transform-object-id'

export class ProjectTypePriceDTO {
  @Expose()
  project_type: ProjectType

  @Expose()
  credit_cost: number
}

export class SubscriptionPlanResponseDTO {
  @Expose()
  @Transform(transform_object_id())
  _id: string

  @Expose()
  name: string

  @Expose()
  description?: string

  @Expose()
  price: number

  @Expose()
  credits: number

  @Expose()
  @Type(() => ProjectTypePriceDTO)
  project_type_prices: ProjectTypePriceDTO[]

  @Expose()
  stripe_price_id?: string
}
