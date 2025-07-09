import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'

import { Public } from '../../common/decarators/public.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { AlreadyExistsError } from '../../common/errors/already-exists.error'
import { ErrorMessage } from '../../constants/errors'
import { EmailService } from '../../services/email.service'
import { AuthService } from './auth.service'
import { GoogleAuthDTO, GoogleAuthResponseDTO } from './dto/google-auth.dto'
import { OTPResponseDTO, SendOTPPhoneEmailDTO } from './dto/otp.dto'
import { SignInResponseDTO, SignUpDTO } from './dto/singup.dto'

@ApiTags(AuthController.resource_name)
@Controller('/api/auth')
export class AuthController {
  static resource_name = 'auth'

  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
      await this.emailService.send({
        email,
        text: `Your verification code: ${code}`,
        subject: 'verification code',
      })
    } catch (error) {
      console.log(error)
    }

    return { data: otp }
  }

  @Public()
  @Post('/signup')
  @ResponseDTO(SignInResponseDTO)
  async signup(
    @Body()
    { email, password, code, code_hash, phone_number, full_name }: SignUpDTO,
  ) {
    const otp = await this.authService.getOTP({
      code,
      code_hash,
    })

    if (!otp) {
      throw new BadRequestException(ErrorMessage.INVALID_OTP_CODE)
    }

    const existing_user = await this.authService.getUserByEmail(email)

    if (existing_user) {
      throw new AlreadyExistsError('user')
    }

    const { access_token } = await this.authService.signup({
      email,
      password,
      full_name,
      phone_number,
    })

    await this.authService.deleteOTP(otp._id)

    return { data: { access_token } }
  }

  @Public()
  @Post('/login')
  @ResponseDTO(SignInResponseDTO)
  async login(
    @Body()
    { email, password }: SignUpDTO,
  ) {
    const user = await this.authService.getUserByEmail(email)

    if (!user) {
      throw new BadRequestException('invalid username or password')
    }

    const password_matches = await bcrypt.compare(user.password, password)

    if (!password_matches) {
      throw new BadRequestException('invalid username or password')
    }

    const access_token = await this.jwtService.signAsync({ user: user._id })

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
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { user } = req

    const result = await this.authService.googleSignIn(user as any)

    const frontend_url = this.configService.get<string>('frontend_url')

    return res.redirect(
      `${frontend_url}/auth/google/callback?token=${result.access_token}`,
    )
  }
}
