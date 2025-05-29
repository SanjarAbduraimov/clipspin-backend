import { IsString, IsUrl } from 'class-validator'

export class CreateProjectDTO {
  @IsString()
  title: string

  @IsString()
  @IsUrl()
  input_video_url: string
}
