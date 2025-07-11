import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'

import { OTP, OTPSchema } from '../../models/otp.schema'
import {
  PasswordReset,
  PasswordResetSchema,
} from '../../models/password-reset.schema'
import { User, UserSchema } from '../../models/user.schema'
import { EmailService } from '../../services/email.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleStrategy } from './strategies/google.strategy'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OTP.name, schema: OTPSchema },
      { name: PasswordReset.name, schema: PasswordResetSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
