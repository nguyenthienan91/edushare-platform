import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Wallet, WalletDocument } from './schemas/wallet.schema'
import { Topup, TopupDocument } from './schemas/topup.schema'

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Topup.name) private topupModel: Model<TopupDocument>,
  ) {}

  async findByUserId(userId: Types.ObjectId): Promise<WalletDocument | null> {
    return this.walletModel.findOne({ userId }).exec()
  }

  async createWallet(userId: Types.ObjectId): Promise<WalletDocument> {
    const wallet = new this.walletModel({ userId, balance: 0, frozenBalance: 0 })
    return wallet.save()
  }

  // Hàm khởi tạo lệnh nạp tiền (Giao cho PayOS Module gọi)
  async createTopupOrder(userId: string, orderCode: number, amount: number) {
    return await this.topupModel.create({
      orderCode,
      userId: new Types.ObjectId(userId),
      amount,
      status: 'pending',
    })
  }

  // Hàm chính thức cộng tiền khi Webhook PayOS báo thành công
  async addBalanceFromPayOS(orderCode: number) {
    // 1. Tìm lệnh nạp tiền đang ở trạng thái pending
    const topupOrder = await this.topupModel.findOne({ orderCode, status: 'pending' })
    if (!topupOrder) return // Nếu không thấy hoặc đã xử lý rồi thì bỏ qua

    // 2. Tìm ví — nếu chưa có thì tạo mới (trường hợp user cũ đăng ký trước khi có auto-create)
    const walletExists = await this.walletModel.findOne({ userId: topupOrder.userId })
    if (!walletExists) {
      await this.createWallet(topupOrder.userId)
    }

    // 3. Cập nhật trạng thái lệnh nạp thành completed
    topupOrder.status = 'completed'
    await topupOrder.save()

    // 4. Cộng tiền vào ví khả dụng (balance) của người dùng
    await this.walletModel.findOneAndUpdate({ userId: topupOrder.userId }, { $inc: { balance: topupOrder.amount } })
  }
}
