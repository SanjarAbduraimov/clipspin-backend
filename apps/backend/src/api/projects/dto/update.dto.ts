import { IsOptional, IsString } from 'class-validator'

export class UpdateProjectDTO {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  input_video_url?: string

  @IsString()
  @IsOptional()
  input_summary: string
}
