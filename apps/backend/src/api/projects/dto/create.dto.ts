import { IsEnum, IsString, IsUrl } from 'class-validator'

import { ProjectType } from 'apps/backend/src/models/project.schema'

export class CreateProjectDTO {
  @IsString()
  title: string

  @IsString()
  @IsUrl()
  input_video_url: string

  @IsEnum(ProjectType)
  @IsString()
  type: ProjectType
}
