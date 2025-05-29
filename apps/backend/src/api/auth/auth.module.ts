import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { OTP, OTPSchema } from '../../models/otp.schema'
import { User, UserSchema } from '../../models/user.schema'
import { EmailService } from '../../services/email.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: OTP.name, schema: OTPSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
