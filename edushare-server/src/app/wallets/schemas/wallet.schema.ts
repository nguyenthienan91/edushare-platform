import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type WalletDocument = HydratedDocument<Wallet>

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId // Liên kết trực tiếp với tài khoản người dùng

  @Prop({ required: true, default: 0, min: 0 })
  balance!: number // Số dư tài khoản khả dụng (tiền có thể dùng mua slot hoặc rút)

  @Prop({ required: true, default: 0, min: 0 })
  frozenBalance!: number // Tiền bị đóng băng (hệ thống giữ trong ví treo)
}

export const WalletSchema = SchemaFactory.createForClass(Wallet)
