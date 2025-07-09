import { Expose } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class SignUpDTO {
  @IsString()
  full_name: string

  @IsString()
  email: string

  @IsString()
  password: string

  @IsString()
  @IsOptional()
  phone_number: string

  @IsNumber()
  code: number

  @IsString()
  code_hash: string
}

export class SignInResponseDTO {
  @Expose()
  access_token: string
}
