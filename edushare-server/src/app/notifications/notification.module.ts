import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Notification, NotificationSchema } from './schemas/notification.schema'
import { NotificationsController } from './notification.controller'
import { NotificationsService } from './notification.service'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'
import { User, UserSchema } from '../users/entities/user.entity'
import { MembershipCronService } from './membership-cron.service'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, PaginationUtilService, MembershipCronService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
