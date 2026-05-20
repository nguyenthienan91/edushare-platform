import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Wallet, WalletSchema } from './schemas/wallet.schema'
import { WalletsController } from './wallets.controller'
import { AdminWithdrawalsController } from './admin-withdrawals.controller'
import { WalletsService } from './wallets.service'
import { Topup, TopupSchema } from './schemas/topup.schema'
import { Withdrawal, WithdrawalSchema } from './schemas/withdrawal.schema'
import { AuthModule } from '../auth/auth.module'
import { PaginationUtilModule } from '../../common/utils/pagination-util/pagination-util.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Topup.name, schema: TopupSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
    forwardRef(() => AuthModule),
    PaginationUtilModule,
  ],
  controllers: [WalletsController, AdminWithdrawalsController],
  providers: [WalletsService],
  exports: [MongooseModule, WalletsService], // Xuất ra để module khác sử dụng
})
export class WalletsModule {}
