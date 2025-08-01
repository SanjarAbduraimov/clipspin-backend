import { Expose, Transform, Type } from 'class-transformer'

import { transform_object_id } from 'apps/backend/src/common/utils/transform-object-id'

import { ProjectOutputDTO } from './result.dto'

export class ProjectInputDTO {
  @Expose()
  url: string

  @Expose()
  source?: string

  @Expose()
  file_key?: string
}

export class ProjectIdeaDTO {
  @Expose()
  script?: string
}

export class ProjectResponseDTO {
  @Expose()
  @Transform(transform_object_id)
  _id: string

  @Expose()
  title: string

  @Expose()
  type: string

  @Expose()
  @Type(() => ProjectInputDTO)
  input: ProjectInputDTO

  @Expose()
  @Type(() => ProjectIdeaDTO)
  suggested_ideas: ProjectIdeaDTO

  @Expose()
  @Type(() => ProjectIdeaDTO)
  selected_idea: ProjectIdeaDTO

  @Expose()
  status: string

  @Expose()
  progress: string

  @Expose()
  @Type(() => ProjectOutputDTO)
  output: ProjectOutputDTO

  @Expose()
  error_cause: string

  @Expose()
  @Transform(transform_object_id)
  voice?: string

  @Expose()
  created_at: string
}
