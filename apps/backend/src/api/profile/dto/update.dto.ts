import { IsOptional, IsString } from 'class-validator'

export class UpdateProfileDTO {
  @IsString()
  @IsOptional()
  full_name: string
}
