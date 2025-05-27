import { Expose, Transform } from 'class-transformer'

import { transform_object_id } from 'src/common/utils/transform-object-id'

export class ProjectResponseDTO {
  @Expose()
  @Transform(transform_object_id)
  _id: string

  @Expose()
  title: string

  @Expose()
  input_video_url: string

  @Expose()
  status: string
}
