import { Expose, Transform } from 'class-transformer'

import { transform_object_id } from 'apps/backend/src/common/utils/transform-object-id'

export class CreditPackResponseDTO {
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
  stripe_price_id?: string
}
