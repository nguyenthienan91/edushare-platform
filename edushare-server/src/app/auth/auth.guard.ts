import type { Request } from 'express'
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { IS_SKIP_AUTH } from './auth.decorator'
import { Reflector } from '@nestjs/core'
import { AuthService } from './auth.service'
import { UserInfo } from '../../common/decorators/user.decorator'
import { TokenKeys } from './consts/jwt.const'

interface AuthenticatedRequest extends Request {
  user?: UserInfo
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isSkipAuth) {
      return true
    }

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractTokenFromHeader(req)
    if (!token) throw new UnauthorizedException()

    try {
      const { iat: _iat, exp: _exp, ...user } = await this.authService.verifyToken(token)
      req.user = user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unauthorized'
      throw new UnauthorizedException(message)
    }
    return true
  }

  private extractTokenFromHeader(req: AuthenticatedRequest): string | undefined {
    const [type, bearerToken] = req.headers.authorization?.split(' ') ?? []
    if (type === 'Bearer') return bearerToken
    const cookieToken = req.cookies[TokenKeys.ACCESS_TOKEN_KEY]
    return cookieToken ?? undefined
  }
}
