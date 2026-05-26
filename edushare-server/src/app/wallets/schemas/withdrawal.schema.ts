import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type WithdrawalDocument = HydratedDocument<Withdrawal>

@Schema({ timestamps: true })
export class Withdrawal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId // Nguoi tao yeu cau rut tien

  @Prop({ required: true, min: 50000 })
  amount!: number // So tien rut (toi thieu 50.000d)

  @Prop({ required: true })
  bankName!: string

  @Prop({ required: true })
  accountNumber!: string

  @Prop({
    required: true,
    uppercase: true,
    match: /^[A-Z0-9\s]+$/,
  })
  accountName!: string // Chu hoa khong dau

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status!: string

  @Prop()
  rejectReason?: string
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal)
