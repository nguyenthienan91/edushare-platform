import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export enum UserRole {
  GUEST = 'guest', // Người dùng đã đăng ký nhưng chưa nâng cấp gói
  MEMBER = 'member', // Sinh viên đã đóng phí (bao gồm cả người tham gia)
  ADMIN = 'admin', // Quản trị viên hệ thống
}

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  id!: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string

  @Prop({ required: true })
  password!: string

  @Prop({ trim: true })
  phoneNumber!: string

  @Prop({ trim: true })
  identityNumber!: string

  @Prop({ type: String, enum: ['male', 'female', 'other'], default: null })
  gender!: string | null

  @Prop({ type: Date, default: null })
  dateOfBirth!: Date | null

  @Prop({ type: String, trim: true, default: null })
  address!: string | null

  @Prop({ trim: true })
  displayName!: string

  @Prop({ type: String, trim: true, default: null })
  avatar!: string | null

  @Prop({ type: String, enum: UserRole, default: UserRole.GUEST })
  role!: UserRole

  @Prop({ default: true })
  isActive!: boolean

  @Prop({ default: false })
  isVerified!: boolean

  @Prop({ default: 5.0 })
  trustScore!: number

  // --- LUỒNG MEMBERSHIP ---

  @Prop({ type: Date, default: null })
  membershipStartedAt!: Date | null // Ngày bắt đầu đóng phí 29k

  @Prop({ type: Date, default: null })
  membershipExpiresAt!: Date | null // Ngày hết hạn (dùng để check auto-lock)

  @Prop({ default: false })
  isSubscriptionActive!: boolean // Trạng thái kích hoạt gói

  @Prop({ type: Date, default: null })
  lastPaymentAt!: Date | null // Ngày thanh toán gần nhất để lưu lịch sử

  // --- LUỒNG FORGOT PASSWORD ---

  @Prop({ type: String, default: null })
  resetPasswordToken!: string | null // Dùng cho link reset qua Email

  @Prop({ type: String, default: null })
  resetPasswordOtp!: string | null // Dùng cho mã OTP qua SMS

  @Prop({ type: Date, default: null })
  resetPasswordExpiresAt!: Date | null // Thời hạn của Token hoặc OTP

  @Prop({ default: false })
  _destroy!: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)
