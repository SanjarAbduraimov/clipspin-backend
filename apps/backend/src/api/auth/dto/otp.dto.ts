import { Expose } from 'class-transformer'
import { IsEmail, IsString } from 'class-validator'

export class SendOTPPhoneNumberDTO {
  @IsString()
  phone_number: string
}

export class SendOTPPhoneEmailDTO {
  @IsString()
  @IsEmail()
  email: string
}

export class OTPResponseDTO {
  @Expose()
  code: string

  @Expose()
  code_hash: string
}
