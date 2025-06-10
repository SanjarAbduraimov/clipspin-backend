import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

import { IS_PUBLIC_KEY } from '../../common/decarators/public.decarator'
import {
  ALLOWED_ROLES_KEY,
  check_access,
} from '../../common/decarators/role.decarator'
import { UserRole } from '../../common/enums/role.enum'
import { ErrorMessage } from '../../constants/errors'
import { AuthService } from './auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const is_public = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    const allowed_roles = this.reflector.getAllAndOverride<UserRole[]>(
      ALLOWED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    ) || [UserRole.USER]

    if (is_public) {
      return true
    }

    const jwt_secret = this.configService.get<string>('jwt_secret')

    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED)
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwt_secret,
      })

      const user = await this.authService.getUser(payload.user)

      if (!user) {
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED)
      }

      if (!check_access(user.role, allowed_roles)) {
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED)
      }

      request['user'] = user
    } catch {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED)
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
