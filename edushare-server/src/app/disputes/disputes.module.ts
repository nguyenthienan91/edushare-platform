import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Dispute, DisputeSchema } from './schemas/dispute.schema'
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema'
import { Wallet, WalletSchema } from '../wallets/schemas/wallet.schema'
import { Group, GroupSchema } from '../groups/entities/group.entity'
import { NotificationsModule } from '../notifications/notification.module'
import { UsersModule } from '../users/users.module'
import { WalletsModule } from '../wallets/wallets.module'
import { AuthModule } from '../auth/auth.module'
import { DisputesController } from './disputes.controller'
import { AdminDisputesController } from './admin-disputes.controller'
import { DisputesService } from './disputes.service'
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dispute.name, schema: DisputeSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
    NotificationsModule,
    UsersModule,
    WalletsModule,
    AuthModule,
  ],
  controllers: [DisputesController, AdminDisputesController],
  providers: [DisputesService, CloudinaryService, PaginationUtilService],
})
export class DisputesModule {}
