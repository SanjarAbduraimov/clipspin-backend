import { Expose } from 'class-transformer'
import { IsNumber, IsString } from 'class-validator'

export class SignInDTO {
  @IsString()
  email: string

  @IsNumber()
  code: number

  @IsString()
  code_hash: string
}

export class SignInResponseDTO {
  @Expose()
  access_token: string
}
