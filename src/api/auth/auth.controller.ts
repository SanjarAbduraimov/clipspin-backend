import { Body, Controller, NotFoundException, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { EmailService } from 'src/services/email.service'

import { Public } from 'src/common/decarators/public.decarator'
import { ResponseDTO } from 'src/common/decarators/response.decarator'
import { ErrorMessage } from 'src/constants/errors'

import { AuthService } from './auth.service'
import { OTPResponseDTO, SendOTPPhoneEmailDTO } from './dto/otp.dto'
import { SignInDTO, SignInResponseDTO } from './dto/singin.dto'

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
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

    const access_token = await this.authService.signIn({
      email,
    })

    await this.authService.deleteOTP(otp._id)

    return { data: { access_token } }
  }
}
