import { Expose } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'

export class ProjectResultDTO {
  @Expose()
  @IsString()
  @IsOptional()
  file_key?: string
}
