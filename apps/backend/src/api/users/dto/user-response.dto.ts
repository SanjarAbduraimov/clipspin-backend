import { Expose, Transform } from 'class-transformer'

import { UserRole } from '../../../common/enums/role.enum'
import { EntityStatus } from '../../../common/enums/status.enum'
import { transform_object_id } from '../../../common/utils/transform-object-id'

export class UserResponseDTO {
  @Expose()
  @Transform(transform_object_id())
  _id: string

  @Expose()
  full_name: string

  @Expose()
  email: string

  @Expose()
  phone_number?: string

  @Expose()
  role: UserRole

  @Expose()
  status: EntityStatus

  @Expose()
  created_at: Date

  @Expose()
  updated_at: Date
}
