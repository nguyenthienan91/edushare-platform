import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { EscrowStatus } from '../enums/escrow-status.enum'

export type TransactionDocument = HydratedDocument<Transaction>

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId!: Types.ObjectId // ID người mua (Member)

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId!: Types.ObjectId // ID của nhóm phần mềm (Spotify, YouTube...)

  @Prop({ required: true, min: 0 })
  amount!: number // Số tiền giao dịch (Ví dụ: 29000)

  @Prop({ type: String, enum: EscrowStatus, default: EscrowStatus.PENDING })
  status!: EscrowStatus // Trạng thái ví treo (pending, held, proof...)

  @Prop({ type: String, default: null })
  proofUrl!: string | null // Link ảnh minh chứng do Chủ nhóm upload

  @Prop({ type: Date, required: true })
  expiresAt!: Date // Mốc thời gian hết hạn 48h để tự động giải ngân
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)
