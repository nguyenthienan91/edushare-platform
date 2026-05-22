import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type RatingDocument = HydratedDocument<Rating>

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId!: Types.ObjectId // Member di danh gia

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId!: Types.ObjectId // Owner bi danh gia

  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true, unique: true })
  transactionId!: Types.ObjectId // Moi giao dich chi danh gia 1 lan

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number

  @Prop({ type: String, trim: true, default: null })
  comment!: string | null
}

export const RatingSchema = SchemaFactory.createForClass(Rating)
