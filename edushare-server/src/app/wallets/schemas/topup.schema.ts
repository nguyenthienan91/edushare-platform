// src/app/wallets/schemas/topup.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type TopupDocument = HydratedDocument<Topup>

@Schema({ timestamps: true })
export class Topup {
  @Prop({ required: true, unique: true })
  orderCode!: number // Mã số hóa đơn dạng số nguyên (bắt buộc đối với PayOS)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId // Ai là người nạp

  @Prop({ required: true, min: 1000 })
  amount!: number // Số tiền nạp (tối thiểu 1.000đ)

  @Prop({ type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status!: string // Trạng thái hóa đơn nạp
}

export const TopupSchema = SchemaFactory.createForClass(Topup)
