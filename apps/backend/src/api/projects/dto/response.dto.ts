import { Expose, Transform, Type } from 'class-transformer'

import { transform_object_id } from 'apps/backend/src/common/utils/transform-object-id'

export class ProjectResultDTO {
  @Expose()
  video_url: string
}

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

  @Expose()
  progress: string

  @Expose()
  @Type(() => ProjectResultDTO)
  result: ProjectResultDTO
}
