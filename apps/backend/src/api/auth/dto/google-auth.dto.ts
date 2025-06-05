import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class GoogleAuthDTO {
  @ApiProperty({
    description: 'Google ID token',
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOTczZWUwZTE2ZjdlZWY4NDEyNDRjZTZiNWRkMDVjNTQzMDg2YmMiLCJ0eXAiOiJKV1QifQ...',
  })
  @IsNotEmpty()
  @IsString()
  idToken: string
}

export class GoogleUserDTO {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string

  @ApiProperty({
    description: 'User profile picture URL',
    example: 'https://lh3.googleusercontent.com/a/profile-picture',
  })
  @IsString()
  picture: string
}

export class GoogleAuthResponseDTO {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string

  @ApiProperty({
    type: GoogleUserDTO,
  })
  user: GoogleUserDTO
}
