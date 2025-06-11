import { Expose, Transform } from 'class-transformer'

import { transform_object_id } from 'apps/backend/src/common/utils/transform-object-id'

export class UserBalanceResponseDTO {
  @Expose()
  @Transform(transform_object_id)
  _id: string

  @Expose()
  credits: number
}
