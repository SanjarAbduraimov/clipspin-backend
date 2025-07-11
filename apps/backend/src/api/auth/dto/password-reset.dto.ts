import { Expose } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ForgotPasswordDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class ResetPasswordDTO {
  @IsString()
  @IsNotEmpty()
  token: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string
}

export class PasswordResetResponseDTO {
  @Expose()
  success: boolean

  @Expose()
  message: string
}
