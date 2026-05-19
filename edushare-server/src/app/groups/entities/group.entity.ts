import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { User } from '../../users/entities/user.entity'

export enum GroupStatus {
  AVAILABLE = 'available',
  FULL = 'full',
  EXPIRED = 'expired',
}

export enum GroupCategory {
  PRODUCTIVITY = 'Productivity',
  DESIGN = 'Design',
  AI_TOOLS = 'AI Tools',
}

export type GroupDocument = HydratedDocument<Group>

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true, trim: true })
  name!: string

  @Prop({ trim: true, default: '' })
  description!: string

  @Prop({
    type: String,
    enum: GroupCategory,
    required: true,
  })
  category!: GroupCategory

  @Prop({ required: true, min: 1 })
  totalSlots!: number

  @Prop({ default: 0, min: 0 })
  occupiedSlots!: number

  @Prop({ type: Number, required: true, min: 0 })
  totalPrice!: number

  @Prop({ type: Number, required: true, min: 0 })
  price!: number

  @Prop({
    type: String,
    enum: GroupStatus,
    default: GroupStatus.AVAILABLE,
  })
  status!: GroupStatus

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  ownerId!: MongooseSchema.Types.ObjectId

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: User.name,
    default: [],
  })
  members!: MongooseSchema.Types.ObjectId[]

  @Prop({
    type: Date,
    default: null,
  })
  expiredAt!: Date | null
}

export const GroupSchema = SchemaFactory.createForClass(Group)

GroupSchema.index({ ownerId: 1 })
GroupSchema.index({ status: 1 })
GroupSchema.index({ category: 1 })
