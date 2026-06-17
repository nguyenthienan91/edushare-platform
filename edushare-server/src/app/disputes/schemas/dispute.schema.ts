import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type DisputeDocument = HydratedDocument<Dispute>

export enum DisputeStatus {
  PENDING = 'pending',
  RESOLVED_REFUND = 'resolved_refund',
  RESOLVED_PAYOUT = 'resolved_payout',
}

@Schema({ timestamps: true })
export class Dispute {
  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true, unique: true })
  transactionId!: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  raisedById!: Types.ObjectId

  @Prop({ required: true })
  reason!: string

  @Prop({ type: [String], required: true })
  memberEvidence!: string[]

  @Prop({ type: [String], default: [] })
  ownerEvidence!: string[]

  @Prop({
    type: String,
    enum: DisputeStatus,
    default: DisputeStatus.PENDING,
  })
  status!: DisputeStatus
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute)
