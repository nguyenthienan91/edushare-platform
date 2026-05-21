import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Transaction, TransactionSchema } from './schemas/transaction.schema'
import { WalletsModule } from '../wallets/wallets.module'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'
import { GroupsModule } from '../groups/groups.module'
import { AuthModule } from '../auth/auth.module'
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service'
import { TransactionsCronService } from './transactions-cron.service'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    WalletsModule,
    GroupsModule,
    AuthModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, CloudinaryService, TransactionsCronService, PaginationUtilService],
})
export class TransactionsModule {}
