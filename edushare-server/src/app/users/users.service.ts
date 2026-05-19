import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model, UpdateQuery } from 'mongoose'
import { User, UserDocument, UserRole } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).select('-password').exec()
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
      { new: true }, // Tham số này để Mongoose trả về dữ liệu MỚI SAU KHI SỬA
    )

    if (!updatedUser) {
      throw new NotFoundException('Không tìm thấy người dùng để nâng cấp')
    }

    return updatedUser
  }

  /**
   * 2. HÀM HẠ CẤP: Chuyển Member về lại Guest khi hết hạn gói
   */
  async downgradeToGuest(userId: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        role: UserRole.GUEST,
        isSubscriptionActive: false,
        // Giữ lại ngày membershipExpiresAt cũ để làm lịch sử xem họ hết hạn khi nào
      },
      { new: true },
    )

    if (!updatedUser) {
      throw new NotFoundException('Không tìm thấy người dùng để hạ cấp')
    }

    return updatedUser
  }
}
