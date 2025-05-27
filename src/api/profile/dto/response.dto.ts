import { Expose, Transform } from 'class-transformer'
import { IsString } from 'class-validator'

import { transform_object_id } from 'src/common/utils/transform-object-id'

export class ProfileResponseDTO {
  @Expose()
  @IsString()
  @Transform(transform_object_id)
  _id: string

  @Expose()
  full_name: string

  @Expose()
  email: string
}
