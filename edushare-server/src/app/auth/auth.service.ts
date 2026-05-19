import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { WalletsService } from '../wallets/wallets.service'
import { StringUtilService } from '../../common/utils/string-util/string-util.service'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { SignInDto, SignUpDto } from './dto/sign.dto'
import { UserInfo, WithUser } from '../../common/decorators/user.decorator'
import { JwtPayload, JWTToken, TokenKeys } from './consts/jwt.const'
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto'
import { randomUUID } from 'crypto'
import { MailService } from '../../common/utils/mail-util/mail.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private walletsService: WalletsService,
    private stringUtilService: StringUtilService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async createToken<T extends Record<string, any>>(payload: T) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: JWTToken.ACCESS_TOKEN_EXPIRE_IN,
    })
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: JWTToken.REFRESH_TOKEN_EXPIRE_IN,
    })

    return {
      [TokenKeys.ACCESS_TOKEN_KEY]: accessToken,
      [TokenKeys.REFRESH_TOKEN_KEY]: refreshToken,
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token)
    } catch (error) {
      throw new UnauthorizedException(error instanceof TokenExpiredError ? 'Token expired' : 'Invalid token')
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, password, ...otherInfo } = signUpDto
    const existing = await this.usersService.getUser({ email })
    if (existing) throw new BadRequestException('User already exist!')

    const passwordHashed = await this.stringUtilService.hash(password)
    const userCreated = await this.usersService.createUser({
      email,
      password: passwordHashed,
      ...otherInfo,
    })
    await this.walletsService.createWallet(userCreated._id as any)
    const { password: _pw, ...userResponse } = userCreated.toObject({
      virtuals: true,
    })
    return userResponse
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto
    const user = await this.usersService.getUser({ email })
    if (!user) throw new UnauthorizedException()

    const isMatch = await this.stringUtilService.compare(password, user.password)
    if (!isMatch) throw new UnauthorizedException()

    const userID = user.id
    const userEmail = user.email
    const role = user.role
    return await this.createToken({ userID, userEmail, role })
  }

  async refreshToken(refreshToken: string) {
    const { iat: _iat, exp: _exp, ...user } = await this.verifyToken(refreshToken)
    return this.createToken(user)
  }

  sendSMS() {
    return {}
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email, phoneNumber, redirectTo } = forgotPasswordDto
    const user = await this.usersService.getUser({
      $or: [{ email }, { phoneNumber }],
    })

    if (!user) throw new UnauthorizedException('Not found user')

    const userEmail = user.email
    if (userEmail) {
      // 1. Tạo Token và thời gian hết hạn (15 phút)
      const token = randomUUID()
      const expires = new Date(Date.now() + 15 * 60 * 1000)

      // 2. Lưu vào database (Sử dụng các trường đã thêm vào Schema trước đó)
      await this.usersService.update(user.id, {
        resetPasswordToken: token,
        resetPasswordExpiresAt: expires.toISOString(),
      })

      // 3. Gửi mail qua Resend
      try {
        await this.mailService.sendResetPasswordEmail(user.email, token, redirectTo)
        return { message: 'Vui lòng kiểm tra email của bạn' }
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi gửi email')
      }
    } else {
      this.sendSMS()
      return { message: 'Vui lòng kiểm tra điện thoại của bạn' }
    }
  }

  async resetPassword(resetPasswordDto: WithUser<ResetPasswordDto>) {
    const { password, user } = resetPasswordDto
    const passwordHashed = await this.stringUtilService.hash(password)
    return await this.usersService.updateById(user.userID, {
      password: passwordHashed,
    })
  }
}
