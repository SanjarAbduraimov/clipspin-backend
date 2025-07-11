import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { OAuth2Client } from 'google-auth-library'
import { Model, Types } from 'mongoose'
import * as crypto from 'node:crypto'

import { EntityStatus } from '../../common/enums/status.enum'
import { OTP } from '../../models/otp.schema'
import { PasswordReset } from '../../models/password-reset.schema'
import { User } from '../../models/user.schema'
import { GoogleUserDTO } from './dto/google-auth.dto'

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(OTP.name) readonly otpModel: Model<OTP>,
    @InjectModel(PasswordReset.name)
    readonly passwordResetModel: Model<PasswordReset>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.client_id'),
      this.configService.get<string>('google.client_secret'),
    )
  }

  generateOTP() {
    const code = Math.floor(100000 + Math.random() * 900000)

    const code_token = crypto.randomBytes(32).toString('hex')
    const code_hash = crypto
      .createHash('sha256')
      .update(code_token)
      .digest('hex')

    return { code, code_hash }
  }

  async getOTP({ code, code_hash }: { code: number; code_hash: string }) {
    const otp = await this.otpModel.findOne({
      code,
      code_hash,
      created_at: { $gte: new Date(Date.now() - 60000) },
    })

    return otp
  }

  deleteOTP(id: Types.ObjectId) {
    return this.otpModel.findByIdAndDelete(id)
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel
      .findOne({
        email,
        status: EntityStatus.ACTIVE,
      })
      .select('+password')

    return user
  }

  async signup(data: Partial<User>) {
    const user = await this.userModel.create(data)

    const access_token = await this.jwtService.signAsync({ user: user._id })

    return { access_token, user }
  }

  async getUser(id: Types.ObjectId) {
    const user = await this.userModel.findOne({
      _id: id,
      status: EntityStatus.ACTIVE,
    })

    return user
  }

  async verifyGoogleToken(token: string): Promise<GoogleUserDTO> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('google.client_id'),
      })

      const payload = ticket.getPayload()

      return {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
      }
    } catch (error) {
      throw new Error('Invalid Google token')
    }
  }

  async googleSignIn(googleUser: GoogleUserDTO, redirect_url?: string) {
    const {
      email,
      firstName: first_name,
      lastName: last_name,
      picture,
    } = googleUser

    const user = await this.userModel.findOneAndUpdate(
      { email, status: EntityStatus.ACTIVE },
      {
        email,
        first_name,
        last_name,
        picture,
        auth_method: 'google',
      },
      { upsert: true, new: true },
    )

    const access_token = await this.jwtService.signAsync({ user: user._id })

    return { access_token, user, redirect_url }
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const reset_token = crypto.randomBytes(32).toString('hex')

    await this.passwordResetModel.findOneAndUpdate(
      { email },
      {
        email,
        token: reset_token,
      },
      { upsert: true, new: true },
    )

    return reset_token
  }

  async validatePasswordResetToken(
    token: string,
  ): Promise<PasswordReset | null> {
    const reset_token = await this.passwordResetModel.findOne({ token })

    return reset_token
  }

  async resetPassword(token: string, new_password: string): Promise<boolean> {
    const reset_token = await this.validatePasswordResetToken(token)

    if (!reset_token) {
      return false
    }

    const user = await this.getUserByEmail(reset_token.email)

    if (!user) {
      return false
    }

    user.password = new_password
    await user.save()

    await this.passwordResetModel.deleteOne({ token })

    return true
  }
}
