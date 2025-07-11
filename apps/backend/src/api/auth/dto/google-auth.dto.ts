import { Expose } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class GoogleAuthDTO {
  @IsNotEmpty()
  @IsString()
  idToken: string
}

export class GoogleUserDTO {
  @IsEmail()
  email: string

  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsString()
  picture: string
}

export class GoogleAuthResponseDTO {
  @Expose()
  access_token: string

  @Expose()
  user: GoogleUserDTO
}
