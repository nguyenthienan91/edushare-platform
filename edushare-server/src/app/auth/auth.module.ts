import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { StringUtilService } from '../../common/utils/string-util/string-util.service'
import { UsersModule } from '../users/users.module'
import { WalletsModule } from '../wallets/wallets.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JWTEnvs } from './consts/jwt.const'
import { MailService } from '../../common/utils/mail-util/mail.service'

@Module({
  imports: [
    UsersModule,
    WalletsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>(JWTEnvs.JWT_SECRET),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, StringUtilService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
