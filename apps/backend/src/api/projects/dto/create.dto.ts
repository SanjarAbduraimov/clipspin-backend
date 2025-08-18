import { Expose, Type } from 'class-transformer'
import {
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator'

import { ProjectType } from 'apps/backend/src/models/project.schema'

class ProjectInputDTO {
  @IsString()
  @IsUrl()
  @Expose()
  url: string
}

export class CreateProjectDTO {
  @IsString()
  title: string

  @IsObject()
  @Type(() => ProjectInputDTO)
  @ValidateNested()
  input: ProjectInputDTO

  @IsEnum(ProjectType)
  @IsString()
  type: ProjectType

  @IsOptional()
  @IsMongoId()
  avatar?: string
}
