import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import dayjs from 'dayjs'
import { InjectModel } from '@nestjs/mongoose'
import type { Model, UpdateQuery } from 'mongoose'
import { Types } from 'mongoose'
import { User, UserDocument, UserRole } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Wallet, WalletDocument } from '../wallets/schemas/wallet.schema'
import { NotificationsService } from '../notifications/notification.service'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly paginationUtilService: PaginationUtilService,
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

  /**
   * Lấy danh sách user có phân trang + tìm kiếm theo tên/email + lọc theo role.
   * @param pagination  page & itemPerPage
   * @param search      Tìm kiếm theo displayName hoặc email (regex, không phân biệt hoa thường)
   * @param role        Lọc theo role ('guest' | 'member' | 'admin')
   */
  async findAllWithPagination(
    pagination: Pagination,
    search?: string,
    role?: UserRole,
  ) {
    const filter: Record<string, any> = { _destroy: false }

    if (search) {
      const regex = new RegExp(search, 'i')
      filter.$or = [{ displayName: regex }, { email: regex }]
    }

    if (role) {
      filter.role = role
    }

    const totalItems = await this.userModel.countDocuments(filter).exec()
    const paging = this.paginationUtilService.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems,
    })

    const users = await this.userModel
      .find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.itemPerPage)
      .lean()
      .exec()

    return this.paginationUtilService.format(users)
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec()
  }

  async findByIdWithBalance(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password').exec()
    if (!user) return null
    const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(id) }).exec()
    return {
      ...user.toObject(),
      balance: wallet ? wallet.balance : 0,
    }
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

  async purchaseVipSubscription(userId: string, months: number) {
    const priceMatrix: Record<number, number> = {
      1: 29000,
      6: 150000,
      12: 250000,
    }

    const price = priceMatrix[months]
    if (!price) {
      throw new BadRequestException('Gói nâng cấp không hợp lệ.')
    }

    const session = await this.userModel.db.startSession()
    session.startTransaction()

    try {
      // 1. Kiểm tra số dư ví khả dụng của User
      const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) }).session(session)
      if (!wallet || wallet.balance < price) {
        throw new BadRequestException(`Số dư không đủ. Bạn cần ít nhất ${price.toLocaleString('vi-VN')} credit để mua gói VIP.`)
      }

      // 2. Thực hiện trừ tiền sạch trong ví
      wallet.balance -= price
      await wallet.save({ session })

      // 3. Tính ngày hết hạn mới
      const now = dayjs()

      const existingUser = await this.userModel.findById(userId).session(session)
      if (!existingUser) throw new NotFoundException('User account not found.')

      const isActivePremium =
        existingUser.isSubscriptionActive === true &&
        existingUser.membershipExpiresAt &&
        dayjs(existingUser.membershipExpiresAt).isAfter(now)

      let startedAt: Date
      let expiresAt: Date

      if (isActivePremium) {
        // Đang còn hạn: giữ nguyên startedAt cũ, cộng dồn expiresAt
        startedAt = existingUser.membershipStartedAt || now.toDate()
        expiresAt = dayjs(existingUser.membershipExpiresAt).add(months, 'month').toDate()
      } else {
        // Hết hạn hoặc chưa từng đăng ký: tính từ now
        startedAt = now.toDate()
        expiresAt = now.add(months, 'month').toDate()
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          role: UserRole.MEMBER,
          membershipStartedAt: startedAt,
          membershipExpiresAt: expiresAt,
          isSubscriptionActive: true,
          lastPaymentAt: now.toDate(),
        },
        { returnDocument: 'after', session },
      )

      if (!updatedUser) {
        throw new NotFoundException('User account not found.')
      }

      // 4. Commit giao dịch tiền tệ an toàn
      await session.commitTransaction()

      // Gửi thông báo SAU KHI commit thành công - fire-and-forget, lỗi noti không ảnh hưởng giao dịch
      const formattedExpiryDate = dayjs(expiresAt).format('DD/MM/YYYY')
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
        message: `Nâng cấp tài khoản VIP thành công thêm ${months} tháng!`,
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
