// src/app/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Notification, NotificationDocument } from './schemas/notification.schema'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly paginationUtil: PaginationUtilService, // Inject class phân trang của bạn
  ) {}

  /**
   * Hàm Core: Dùng để bắn thông báo (Hệ thống hoặc các module khác gọi sang)
   */
  async createNotification(userId: string | Types.ObjectId, title: string, content: string, type: string) {
    const newNotification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      title,
      content,
      type,
    })
    return await newNotification.save()
  }

  /**
   * API: Lấy danh sách thông báo của chính User đang đăng nhập (Có phân trang)
   */
  async getUserNotifications(userId: string, page: number = 1, itemPerPage: number = 10) {
    const filter = { userId: new Types.ObjectId(userId) }

    // 1. Đếm tổng số thông báo
    const totalItems = await this.notificationModel.countDocuments(filter).exec()

    // 2. Tính toán phân trang qua Util của bạn
    this.paginationUtil.paging({ page, itemPerPage, totalItems })

    // 3. Query DB
    const list = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 }) // Thông báo mới nhất xếp lên đầu
      .skip(this.paginationUtil.skip)
      .limit(this.paginationUtil.itemPerPage)
      .exec()

    // 4. Trả về format chuẩn của bạn
    return {
      status: 'success',
      ...this.paginationUtil.format(list),
    }
  }

  /**
   * API: Đánh dấu thông báo là đã đọc
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOne({
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId), // Để đảm bảo ông User này không đọc trộm thông báo ông khác
    })

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo tương ứng.')
    }

    notification.isRead = true
    await notification.save()

    return { status: 'success', message: 'Đã đọc thông báo.' }
  }
}
