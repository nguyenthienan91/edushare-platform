import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type NotificationDocument = HydratedDocument<Notification>

@Schema({ timestamps: true }) // Tự động sinh ra createdAt (Thời gian gửi thông báo)
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId

  @Prop({ required: true })
  title!: string // Tiêu đề (Ví dụ: "Thành viên mới")

  @Prop({ required: true })
  content!: string // Nội dung chi tiết

  @Prop({ type: String, enum: ['transaction', 'membership', 'system'], required: true })
  type!: string // Phân loại để FE hiển thị icon tương ứng

  @Prop({ type: Boolean, default: false })
  isRead!: boolean // Trạng thái đã đọc hay chưa
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
