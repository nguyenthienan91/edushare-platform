import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { AdminUsersController } from './admin-users.controller'
import { User, UserSchema } from './entities/user.entity'
import { NotificationsModule } from '../notifications/notification.module'
import { WalletsModule } from '../wallets/wallets.module'
import { AuthModule } from '../auth/auth.module'
import { GroupsModule } from '../groups/groups.module'
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service'
import { PaginationUtilModule } from '../../common/utils/pagination-util/pagination-util.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => NotificationsModule),
    forwardRef(() => AuthModule),
    forwardRef(() => WalletsModule),
    forwardRef(() => GroupsModule),
    PaginationUtilModule,
  ],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, CloudinaryService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
