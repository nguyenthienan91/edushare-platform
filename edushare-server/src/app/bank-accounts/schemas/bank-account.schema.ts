import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type BankAccountDocument = HydratedDocument<BankAccount>

@Schema({ timestamps: true })
export class BankAccount {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId

  @Prop({ required: true, trim: true })
  bankName!: string

  @Prop({ required: true, trim: true })
  accountNumber!: string

  @Prop({ required: true, trim: true })
  accountName!: string

  @Prop({ type: String, trim: true, default: null })
  branch!: string | null

  @Prop({ default: false })
  isDefault!: boolean
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount)
