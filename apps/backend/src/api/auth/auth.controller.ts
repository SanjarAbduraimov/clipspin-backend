import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'

import { Public } from '../../common/decarators/public.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { ErrorMessage } from '../../constants/errors'
import { EmailService } from '../../services/email.service'
import { UserBalanceService } from '../user-balance/user-balance.service'
import { AuthService } from './auth.service'
import { GoogleAuthDTO, GoogleAuthResponseDTO } from './dto/google-auth.dto'
import { OTPResponseDTO, SendOTPPhoneEmailDTO } from './dto/otp.dto'
import { SignInDTO, SignInResponseDTO } from './dto/singin.dto'

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly user_balance_service: UserBalanceService,
  ) {}

  @Public()
  @Post('/otp/email')
  @ResponseDTO(OTPResponseDTO)
  async sendEmailOTP(@Body() { email }: SendOTPPhoneEmailDTO) {
    const otp_code = this.authService.generateOTP()
    const code_hash = otp_code.code_hash
    const code = otp_code.code

    const otp = await this.authService.otpModel.create({
      code,
      code_hash,
      email,
      auth_method: 'email',
    })

    try {
      await this.emailService.send(email, `${code}`)
    } catch (error) {
      console.log(error)
    }

    return { data: otp }
  }

  @Public()
  @Post('/signin')
  @ResponseDTO(SignInResponseDTO)
  async signin(@Body() { code, code_hash, email }: SignInDTO) {
    const otp = await this.authService.getOTP({ code, code_hash })

    if (!otp) {
      throw new NotFoundException(ErrorMessage.INVALID_OTP_CODE)
    }

    const { access_token, user } = await this.authService.signIn({
      email,
    })

    // create user balance default
    await this.user_balance_service.setUpUserbalance(user._id)

    await this.authService.deleteOTP(otp._id)

    return { data: { access_token } }
  }

  @Public()
  @Post('/google')
  @ResponseDTO(GoogleAuthResponseDTO)
  async googleAuth(
    @Query('redirect_url') redirectUrl: string,
    @Body() { idToken }: GoogleAuthDTO,
  ) {
    try {
      const redirect_url = redirectUrl || null
      console.log('redirect_url in /google', redirect_url)
      const google_user = await this.authService.verifyGoogleToken(idToken)
      const result = await this.authService.googleSignIn(
        google_user,
        redirect_url,
      )

      return { data: result }
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token')
    }
  }

  @Public()
  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Query('redirect_url') redirectUrl: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const { user } = req
    console.log(
      'redirect_url in /google/callback',
      JSON.stringify(req.query),
      redirectUrl,
    )
    const result = await this.authService.googleSignIn(user)

    const frontend_url = this.configService.get<string>('FRONTEND_URL')

    return res.redirect(
      `${frontend_url}/auth/google/callback?token=${result.access_token}`,
    )
  }
}
