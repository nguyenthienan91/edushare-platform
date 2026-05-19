import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Wallet, WalletSchema } from './schemas/wallet.schema'
import { WalletsController } from './wallets.controller'
import { WalletsService } from './wallets.service'
import { Topup, TopupSchema } from './schemas/topup.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Topup.name, schema: TopupSchema },
    ]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [MongooseModule, WalletsService], // Xuất ra để module khác sử dụng
})
export class WalletsModule {}
