import { Type } from 'class-transformer'
import {
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

class ProjectIdeaDTO {
  @IsString()
  script: string
}

export class UpdateProjectDTO {
  @IsString()
  @IsOptional()
  title?: string

  @IsObject()
  @IsOptional()
  @Type(() => ProjectIdeaDTO)
  @ValidateNested()
  selected_idea?: ProjectIdeaDTO

  @IsOptional()
  @IsMongoId()
  avatar?: string
}
