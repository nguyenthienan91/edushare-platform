// src/app/notifications/membership-cron.service.ts (Hoặc nhét vào file Cron chung của bạn)
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument, UserRole } from '../users/entities/user.entity'
import { NotificationsService } from './notification.service'

@Injectable()
export class MembershipCronService {
  private readonly logger = new Logger(MembershipCronService.name)

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * NHIỆM VỤ 1: Quét và nhắc nhở những tài khoản sắp hết hạn trước 3 ngày
   * Chạy lúc 00:05 mỗi đêm (Tránh chạy trùng khít 00:00 với hàm hạ cấp để giảm tải DB)
   */
  @Cron('5 0 * * *')
  async remindExpiringVip() {
    this.logger.log('Bắt đầu quét các tài khoản VIP sắp hết hạn sau 3 ngày nữa...')

    try {
      // 1. Tính mốc thời gian bắt đầu và kết thúc của ngày thứ 3 tính từ hôm nay
      const targetDateStart = new Date()
      targetDateStart.setDate(targetDateStart.getDate() + 3)
      targetDateStart.setHours(0, 0, 0, 0)

      const targetDateEnd = new Date()
      targetDateEnd.setDate(targetDateEnd.getDate() + 3)
      targetDateEnd.setHours(23, 59, 59, 999)

      // 2. Tìm ra những ông có `membershipExpiresAt` rơi đúng vào ngày thứ 3 đó
      const expiringUsers = await this.userModel
        .find({
          isSubscriptionActive: true,
          membershipExpiresAt: { $gte: targetDateStart, $lte: targetDateEnd },
        })
        .exec()

      this.logger.log(`Tìm thấy ${expiringUsers.length} người dùng sắp hết hạn gói VIP.`)

      // 3. Bắn thông báo song song cho tất cả user cùng lúc
      await Promise.allSettled(
        expiringUsers.map((user) => {
          const formattedDate = user.membershipExpiresAt
            ? new Date(user.membershipExpiresAt).toLocaleDateString('vi-VN')
            : ''

          return this.notificationsService.createNotification(
            user._id.toString(),
            'Gói thành viên sắp hết hạn! ⏳',
            `Gói EduShare Member của bạn sẽ hết hạn vào ngày ${formattedDate} (sau 3 ngày nữa). Hãy đảm bảo số dư ví có đủ 29.000đ để tiếp tục duy trì quyền lợi nhé!`,
            'membership',
          )
        }),
      )
    } catch (error) {
      this.logger.error(`remindExpiringVip failed: ${(error as Error).message}`)
    }
  }

  /**
   * NHIỆM VỤ 2: Thực hiện hạ cấp các tài khoản thực sự đã hết hạn hôm nay
   * Chạy lúc 00:00 hằng đêm
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoDowngradeExpiredVip() {
    this.logger.log('Bắt đầu quét và hạ cấp các tài khoản VIP đã hết hạn...')

    try {
      const now = new Date()

      // 1. Trước khi update hàng loạt, lấy danh sách ID để bắn thông báo sau
      const expiredUsers = await this.userModel
        .find({
          isSubscriptionActive: true,
          membershipExpiresAt: { $lte: now },
        })
        .select('_id')
        .exec()

      if (expiredUsers.length === 0) {
        this.logger.log('Không có tài khoản VIP nào hết hạn hôm nay.')
        return
      }

      // 2. Hạ cấp hàng loạt về Guest
      const result = await this.userModel.updateMany(
        {
          isSubscriptionActive: true,
          membershipExpiresAt: { $lte: now },
        },
        {
          role: UserRole.GUEST,
          isSubscriptionActive: false,
        },
      )

      // 3. Bắn thông báo song song cho tất cả user bị hạ cấp
      await Promise.allSettled(
        expiredUsers.map((user) =>
          this.notificationsService.createNotification(
            user._id.toString(),
            'Gói thành viên đã hết hạn ❌',
            'Gói EduShare Member của bạn đã chính thức hết hạn vào hôm nay. Bạn đã bị chuyển về quyền Guest và tạm thời không thể gửi yêu cầu tham gia các nhóm dùng chung mới. Hãy gia hạn ngay để mở khóa lại tính năng nhé!',
            'membership',
          ),
        ),
      )

      this.logger.log(
        `Đã hạ cấp thành công ${result.modifiedCount} tài khoản VIP hết hạn về lại Guest và gửi thông báo.`,
      )
    } catch (error) {
      this.logger.error(`autoDowngradeExpiredVip failed: ${(error as Error).message}`)
    }
  }
}
