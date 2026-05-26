import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { User, UserSchema } from './entities/user.entity'
import { NotificationsModule } from '../notifications/notification.module'
import { WalletsModule } from '../wallets/wallets.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => NotificationsModule),
    forwardRef(() => AuthModule),
    WalletsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
