import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model, UpdateQuery } from 'mongoose'
import { Types } from 'mongoose'
import { User, UserDocument, UserRole } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Wallet, WalletDocument } from '../wallets/schemas/wallet.schema'
import { NotificationsService } from '../notifications/notification.service'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getUser(filter: Partial<User> & Record<string, any>): Promise<UserDocument | null> {
    return this.userModel.findOne(filter).exec()
  }

  async createUser(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data)
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec()
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec()
  }

  async updateById(id: string, data: UpdateQuery<UserDocument>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, data, { returnDocument: 'after' }).select('-password').exec()
  }

  async deleteById(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec()
  }

  // Alias methods used by UsersController DTOs
  create(createUserDto: CreateUserDto) {
    return this.createUser(createUserDto as unknown as Partial<User>)
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.updateById(id, updateUserDto)
  }

  remove(id: string) {
    return this.deleteById(id)
  }

  async banUser(id: string) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' })
      .select('-password')
      .exec()

    if (!updatedUser) {
      throw new NotFoundException('User not found')
    }

    return {
      message: 'User banned successfully',
      data: updatedUser,
    }
  }

  async unbanUser(id: string) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { isActive: true }, { returnDocument: 'after' })
      .select('-password')
      .exec()

    if (!updatedUser) {
      throw new NotFoundException('User not found')
    }

    return {
      message: 'User unbanned successfully',
      data: updatedUser,
    }
  }

  async upgradeToMember(userId: string): Promise<User> {
    const durationInDays = 30
    const startedAt = new Date()

    // Tính toán ngày hết hạn (Cộng thêm 30 ngày)
    const expiresAt = new Date()
    expiresAt.setDate(startedAt.getDate() + durationInDays)

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        role: UserRole.MEMBER,
        membershipStartedAt: startedAt,
        membershipExpiresAt: expiresAt,
        isSubscriptionActive: true,
        lastPaymentAt: startedAt,
      },
      { returnDocument: 'after' }, // Tham số này để Mongoose trả về dữ liệu MỚI SAU KHI SỬA
    )

    if (!updatedUser) {
      throw new NotFoundException('Không tìm thấy người dùng để nâng cấp')
    }

    return updatedUser
  }

  async downgradeToGuest(userId: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        role: UserRole.GUEST,
        isSubscriptionActive: false,
        // Giữ lại ngày membershipExpiresAt cũ để làm lịch sử xem họ hết hạn khi nào
      },
      { returnDocument: 'after' },
    )

    if (!updatedUser) {
      throw new NotFoundException('Không tìm thấy người dùng để hạ cấp')
    }

    return updatedUser
  }

  async purchaseVipSubscription(userId: string) {
    const VIP_PRICE = 29000 // Giá gói VIP hệ thống quy định
    const session = await this.userModel.db.startSession()
    session.startTransaction()

    try {
      // 1. Kiểm tra số dư ví khả dụng của User
      const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) }).session(session)
      if (!wallet || wallet.balance < VIP_PRICE) {
        throw new BadRequestException('Insufficient balance. You need at least 29,000đ to purchase a VIP subscription.')
      }

      // 2. Thực hiện trừ tiền sạch trong ví
      wallet.balance -= VIP_PRICE
      await wallet.save({ session })

      // 3. Gọi hàm nâng cấp quyền User lên MEMBER (Tái sử dụng hàm bạn đã viết)
      const durationInDays = 30
      const startedAt = new Date()
      const expiresAt = new Date()
      expiresAt.setDate(startedAt.getDate() + durationInDays)

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          role: UserRole.MEMBER,
          membershipStartedAt: startedAt,
          membershipExpiresAt: expiresAt,
          isSubscriptionActive: true,
          lastPaymentAt: startedAt,
        },
        { returnDocument: 'after', session },
      )

      if (!updatedUser) {
        throw new NotFoundException('User account not found.')
      }

      // 4. Commit giao dịch tiền tệ an toàn
      await session.commitTransaction()

      // Gửi thông báo SAU KHI commit thành công - fire-and-forget, lỗi noti không ảnh hưởng giao dịch
      const formattedExpiryDate = expiresAt.toLocaleDateString('vi-VN')
      this.notificationsService
        .createNotification(
          userId, // Người nhận thông báo chính là User vừa mua gói
          'Nâng cấp VIP thành công! 🎉', // Tiêu đề
          `Chúc mừng bạn đã kích hoạt thành công quyền thành viên EduShare Member. Gói có thời hạn đến ngày ${formattedExpiryDate}. Giờ đây bạn đã có thể tự do tham gia các nhóm dùng chung phần mềm!`,
          'membership',
        )
        .catch((err) => console.error(`Failed to send VIP upgrade notification: ${err.message}`))

      return {
        status: 'success',
        message: 'Nâng cấp tài khoản VIP thành công trong 30 ngày!',
        data: {
          role: updatedUser.role,
          membershipExpiresAt: updatedUser.membershipExpiresAt,
          isSubscriptionActive: updatedUser.isSubscriptionActive,
        },
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
